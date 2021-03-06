import { TextSelection, Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const ZERO_WIDTH_SPACE = '\u200B',
      CLASS_NAME = 'simpla-text-placeholder',
      ATTRIBUTE_NAME = 'data-placeholder',
      STYLE_RULES = `
.${CLASS_NAME} {
display: inline-block;
cursor: text;
}
.${CLASS_NAME}::before {
content: attr(${ATTRIBUTE_NAME});
opacity: 0.5;
}`;

let pluginKey = new PluginKey('placeholder');

function stateHasChildren(state) {
  return state.doc.childCount > 0;
}

function getFirstNodeSpace(state) {
  return stateHasChildren(state) ? 1 : 0;
}

function createPlaceholderNode(text) {
  let placeholder = document.createElement('span');

  placeholder.className = CLASS_NAME;
  placeholder.setAttribute(ATTRIBUTE_NAME, text);

  return placeholder;
}

function createStylingNode() {
  let style = document.createElement('style');
  style.innerHTML = STYLE_RULES;
  return style;
}

function shouldBeShowingPlaceholder(state) {
  let doc = state.doc,
      noChildren = !stateHasChildren(state),
      justAnEmptyChild =
      doc.childCount === 1 &&
      doc.firstChild.isTextblock &&
      doc.firstChild.content.size === 0,
      { viewIsEditable } = pluginKey.getState(state);

  return viewIsEditable && (noChildren || justAnEmptyChild);
}

function handleViewChange(view) {
  let { viewIsEditable } = pluginKey.getState(view.state);

  if (viewIsEditable !== view.editable) {
    view.dispatch(
      view.state.tr.setMeta(pluginKey, { viewIsEditable: view.editable })
    );
  }
}

function createPaddingWidget(state) {
  return Decoration.widget(
    getFirstNodeSpace(state),
    document.createTextNode(ZERO_WIDTH_SPACE),
    { key: 'padding' }
  )
}

function createPlaceholderWidget(state, text) {
  return Decoration.widget(
    getFirstNodeSpace(state),
    createPlaceholderNode(text),
    { key: 'placeholder' }
  );
}

function createStyleWidget(state) {
  return Decoration.widget(
    getFirstNodeSpace(state),
    createStylingNode(),
    { key: 'placeholder-styles' }
  );
}

function resetCursor(view) {
  let insideFirstNode = view.state.doc.content.size > 0 ? 1 : 0,
      selection = TextSelection.create(view.state.doc, insideFirstNode);

  view.dispatch(view.state.tr.setSelection(selection));
}

export default function makePlaceholderPlugin({ text }) {
  return new Plugin({
    key: pluginKey,

    view(view) {
      handleViewChange(view);
      return {
        update: handleViewChange
      };
    },

    state: {
      init: () => ({ viewIsEditable: false }),
      apply: (tr, pluginState) => tr.getMeta(pluginKey) || pluginState
    },

    props: {
      onFocus(view) {
        if (shouldBeShowingPlaceholder(view.state)) {
          resetCursor(view);
        }
      },

      decorations(state) {
        if (shouldBeShowingPlaceholder(state)) {
          return DecorationSet.create(state.doc, [
            createPaddingWidget(state),
            createPlaceholderWidget(state, text),
            createStyleWidget(state)
          ]);
        }
      },

      handleClick(view, pos, event) {
        let fromPlaceholder = event.target.classList.contains(CLASS_NAME);

        if (fromPlaceholder) {
          let insideFirstNode = view.state.doc.content.size > 0 ? 1 : 0,
              selection = TextSelection.create(view.state.doc, insideFirstNode);

          view.dispatch(view.state.tr.setSelection(selection));
        }

        if (view.hasFocus() && shouldBeShowingPlaceholder(view.state)) {
          resetCursor(view);
          return true;
        }
      },

      handleKeyDown(view, event) {
        let focused = view.hasFocus(),
            showingPlaceholder = shouldBeShowingPlaceholder(view.state),
            isLeftOrRight = event.keyCode === 37 || event.keyCode === 39;

        if (focused && showingPlaceholder && isLeftOrRight) {
          return true;
        }
      }
    },

    toJSON: state => Object.assign({}, state),
    fromJSON: state => Object.ssign({}, state)
  });
}
