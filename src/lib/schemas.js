import { marks, nodes } from 'prosemirror-schema-basic';
import {
  bulletList as unorderedListSpec,
  orderedList as orderedListSpec,
  listItem as listItemSpec
} from 'prosemirror-schema-list';

const sharedListSpec = { content: 'list_item+', group: 'block' };

const underlineNode = {
  parseDOM: [
    { tag: 'u' },
    {
      style: 'font-style',
      getAttrs: value => {
        if (value === 'underline') {
          return true;
        }
      }
    }
  ],

  toDOM: () => ['u']
};

const imgNode = {
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null }
  },
  group: 'block',
  draggable: true,
  parseDOM: [
    {
      tag: 'img[src]',
      getAttrs(dom) {
        return {
          src: dom.getAttribute('src'),
          title: dom.getAttribute('title'),
          alt: dom.getAttribute('alt')
        };
      }
    }
  ],
  toDOM(node) {
    return ['img', node.attrs];
  }
};

export const italic = { marks: { italic: marks.em } };
export const bold = { marks: { bold: marks.strong } };
export const link = { marks: { link: marks.link } };
export const underline = { marks: { underline: underlineNode } };

export const blockquote = { nodes: { blockquote: nodes.blockquote } };
export const heading = { nodes: { heading: nodes.heading } };
export const image = { nodes: { image: imgNode } };
export const list = {
  nodes: {
    orderedList: Object.assign({}, sharedListSpec, orderedListSpec),
    unorderedList: Object.assign({}, sharedListSpec, unorderedListSpec),
    list_item: Object.assign({ content: 'paragraph block*' }, listItemSpec)
  }
};

export const inline = {
  nodes: {
    doc: { content: 'inline<_>*' },
    text: nodes.text,
    hardBreak: nodes.hard_break
  }
};

export const block = {
  nodes: {
    doc: { content: 'block+' },
    text: nodes.text,
    hardBreak: nodes.hard_break,
    paragraph: nodes.paragraph
  }
};
