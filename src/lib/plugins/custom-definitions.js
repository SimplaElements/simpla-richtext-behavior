import {
  orderedListRule as getOrderedListRule,
  bulletListRule as getBulletListRule
} from '../input-rules';
import {
  toggleMark,
  applyMark,
  removeMark,
  setBlockTo,
  toggleBlock,
  wrapIn,
  unwrapFrom,
  toggleWrapping,
  resetBlock,
  splitListItem,
  embed
} from '../commands';
import {
  markIsApplied,
  attrsFor,
  canToggleMark,
  findMark,
  currentBlockIs,
  canToggleBlock,
  getCurrentBlock,
  wrappedIn,
  canToggleWrapping,
  canEmbed
} from '../utils';

const FORMAT = 'Format', EMBED = 'Embed', INPUT = 'Input';

function makeMarkPlugin({ name, keys }) {
  return {
    name,
    type: FORMAT,
    keymap: keys ? { [keys]: toggleMark(name)() } : undefined,
    toggle: toggleMark(name),
    apply: applyMark(name),
    remove: removeMark(name),
    isApplied: markIsApplied(name),
    isApplicable: canToggleMark(name),
    getMeta: attrsFor(findMark(name))
  };
}

export const link = makeMarkPlugin({ name: 'link' });
export const bold = makeMarkPlugin({ name: 'bold', keys: 'Mod-b' });
export const italic = makeMarkPlugin({ name: 'italic', keys: 'Mod-i' });
export const underline = makeMarkPlugin({ name: 'underline', keys: 'Mod-u' });

export const heading = {
  name: 'heading',
  type: FORMAT,
  apply: setBlockTo('heading'),
  remove: resetBlock(),
  toggle: toggleBlock('heading'),
  isApplied: currentBlockIs('heading'),
  isApplicable: canToggleBlock('heading'),
  getMeta: attrsFor(getCurrentBlock)
};

export const blockquote = {
  name: 'blockquote',
  type: FORMAT,
  apply: wrapIn('blockquote'),
  remove: unwrapFrom('blockquote'),
  toggle: toggleWrapping('blockquote'),
  isApplicable: canToggleWrapping('blockquote'),
  isApplied: wrappedIn('blockquote')
};

export const list = {
  name: 'list',
  type: INPUT,
  keymap: { Enter: splitListItem('list_item')() },
  isApplied: () => {},
  isApplicable: () => {},
  getInputRules({ schema }) {
    let orderedListRule = getOrderedListRule(schema.nodes.orderedList),
        unorderedListRule = getBulletListRule(schema.nodes.unorderedList);

    return [orderedListRule, unorderedListRule];
  }
};

export const image = {
  name: 'image',
  type: EMBED,
  embed: embed('image'),
  isApplicable: canEmbed('image'),
  isApplied: currentBlockIs('image'),
  getMeta: attrsFor(getCurrentBlock)
};
