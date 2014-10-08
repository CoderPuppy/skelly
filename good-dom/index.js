// Generated by LiveScript 1.2.0
(function(){
  var EventEmitter, domready, findEl, Node, TextNode, ParentNode, Element, DocumentFragment, Document, doc, el, ready, slice$ = [].slice;
  EventEmitter = require('events').EventEmitter;
  domready = require('domready');
  findEl = function(el){
    var oldEl;
    oldEl = null;
    while (el !== oldEl) {
      oldEl = el;
      if (el.el != null) {
        el = el.el;
      }
      if (el._el != null) {
        el = el._el;
      }
      if (el.node != null) {
        el = el.node;
      }
      if (el._node != null) {
        el = el._node;
      }
    }
    return el;
  };
  Node = (function(superclass){
    var prototype = extend$((import$(Node, superclass).displayName = 'Node', Node), superclass).prototype, constructor = Node;
    function Node(_node){
      this._node = _node;
      this.on('newListener', function(name, handler){
        return this._node.addEventListener(name, handler);
      });
    }
    prototype.outerHtml = function(val){
      if (val != null) {
        this._node.outerHtml = val;
        return this;
      } else {
        return this._node.outerHTML;
      }
    };
    prototype.text = function(text){
      if (text != null) {
        this._node.textContent = text;
        return this;
      } else {
        return this._node.textContent;
      }
    };
    prototype.parent = function(){
      return Node.wrap(this._node.parentNode);
    };
    Node.wrap = function(node){
      switch (node.nodeType) {
      case window.Node.DOCUMENT_NODE:
        return new Document(node);
      case window.Node.DOCUMENT_FRAGMENT_NODE:
        return new DocumentFragment(node);
      case window.Node.ELEMENT_NODE:
        return new Element(node);
      case window.Node.TEXT_NODE:
        return new TextNode(node);
      default:
        return new Node(node);
      }
    };
    return Node;
  }(EventEmitter));
  TextNode = (function(superclass){
    var prototype = extend$((import$(TextNode, superclass).displayName = 'TextNode', TextNode), superclass).prototype, constructor = TextNode;
    function TextNode(text){
      if (typeof text === 'string') {
        TextNode.superclass.call(this, document.createTextNode(text));
      } else if (text != null && text.nodeType === window.Node.TEXT_NODE) {
        TextNode.superclass.call(this, text);
      } else if (text instanceof this.constructor) {
        return text;
      } else {
        console.log(text);
        throw new Error('Bad text for new TextNode(text): ' + text);
      }
    }
    return TextNode;
  }(Node));
  ParentNode = (function(superclass){
    var prototype = extend$((import$(ParentNode, superclass).displayName = 'ParentNode', ParentNode), superclass).prototype, constructor = ParentNode;
    prototype.append = function(node){
      var e;
      try {
        this._node.appendChild(findEl(node));
      } catch (e$) {
        e = e$;
        console.log(e, e.stack, node);
      }
      return this;
    };
    prototype.children = function(){
      return [].slice.call(this._node.childNodes).map(Node.wrap);
    };
    function ParentNode(){
      ParentNode.superclass.apply(this, arguments);
    }
    return ParentNode;
  }(Node));
  Element = (function(superclass){
    var prototype = extend$((import$(Element, superclass).displayName = 'Element', Element), superclass).prototype, constructor = Element;
    function Element(tag){
      if (typeof tag === 'string') {
        this.tagName = tag;
        Element.superclass.call(this, document.createElement(tag));
      } else {
        Element.superclass.call(this, tag);
      }
    }
    return Element;
  }(ParentNode));
  DocumentFragment = (function(superclass){
    var prototype = extend$((import$(DocumentFragment, superclass).displayName = 'DocumentFragment', DocumentFragment), superclass).prototype, constructor = DocumentFragment;
    function DocumentFragment(doc){
      doc == null && (doc = document.createDocumentFragment());
      DocumentFragment.superclass.call(this, doc);
    }
    return DocumentFragment;
  }(ParentNode));
  Document = (function(superclass){
    var prototype = extend$((import$(Document, superclass).displayName = 'Document', Document), superclass).prototype, constructor = Document;
    function Document(doc){
      var this$ = this;
      doc == null && (doc = document.implementation.createHTMLDocument());
      Document.superclass.call(this, doc);
      domready(function(){
        return this$.body = new Element(this$._node.body);
      });
    }
    return Document;
  }(DocumentFragment));
  doc = new Document(document);
  el = function(tagName){
    var args, el, i$, len$, arg;
    args = slice$.call(arguments, 1);
    el = new Element(tagName);
    for (i$ = 0, len$ = args.length; i$ < len$; ++i$) {
      arg = args[i$];
      switch (false) {
      case typeof arg !== 'string':
        el.text(el.text() + arg);
        break;
      case !(typeof arg === 'object' && findEl(arg) == null):
        break;
      default:
        el.append(arg);
      }
    }
    return el;
  };
  ready = function(it){
    return domready(it);
  };
  exports.DocumentFragment = DocumentFragment;
  exports.Document = Document;
  exports.TextNode = TextNode;
  exports.Element = Element;
  exports.findEl = findEl;
  exports.ready = ready;
  exports.Node = Node;
  exports.doc = doc;
  exports.el = el;
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
