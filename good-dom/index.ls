{EventEmitter} = require \events
domready       = require \domready

find-el = (el) ->
	old-el = null
	while el != old-el
		old-el = el

		el = el.el if el.el?
		el = el._el if el._el?
		el = el.node if el.node?
		el = el._node if el._node?

	el

class Node extends EventEmitter
	(@_node) ->
		@on \newListener (name, handler) ->
			@_node.add-event-listener name, handler

	outerHtml: (val) ->
		if val?
			@_node.outerHtml = val
			@
		else
			@_node.outerHTML

	text: (text) ->
		if text?
			@_node.textContent = text
			@
		else
			@_node.textContent

	parent: ->
		Node.wrap @_node.parentNode

	@wrap = (node) ->
		switch node.nodeType
			when window.Node.DOCUMENT_NODE then new Document node
			when window.Node.DOCUMENT_FRAGMENT_NODE then new DocumentFragment node
			when window.Node.ELEMENT_NODE then new Element node
			when window.Node.TEXT_NODE then new TextNode node
			else new Node node

class TextNode extends Node
	(text) ->
		if typeof text == 'string'
			super document.createTextNode text
		else if text? and text.nodeType == window.Node.TEXT_NODE
			super text
		else if text instanceof @constructor
			return text
		else
			console.log text
			throw new Error('Bad text for new TextNode(text): ' + text)

class ParentNode extends Node
	append: (node) ->
		try
			@_node.appendChild find-el node
		catch e
			console.log e, e.stack, node
		@

	children: -> [].slice.call(@_node.childNodes).map Node.wrap

class Element extends ParentNode
	(tag) ->
		if typeof tag == 'string'
			@tagName = tag
			super document.createElement tag
		else
			super tag

class DocumentFragment extends ParentNode
	(doc = document.createDocumentFragment()) ->
		super doc

class Document extends DocumentFragment
	(doc = document.implementation.createHTMLDocument()) ->
		super doc
		domready ~>
			@body = new Element @_node.body

doc = new Document document

el = (tag-name, ...args) ->
	el = new Element(tag-name)

	for arg in args
		switch
		| typeof arg == 'string'                    => el.text el.text! + arg
		| typeof arg == 'object' and !find-el(arg)? => # handle attributes
		| _                                         => el.append arg

	el

ready = ->
	domready it

exports.DocumentFragment = DocumentFragment
exports.Document         = Document
exports.TextNode         = TextNode
exports.Element          = Element
exports.find-el          = find-el
exports.ready            = ready
exports.Node             = Node
exports.doc              = doc
exports.el               = el