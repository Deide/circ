exports = window.chat ?= {}

class HTMLList extends EventEmitter
  constructor: (@$list, @ordered=false) ->
    @nodes = {}
    super

  add: (names...) ->
    for name in names
      continue if name of @nodes
      if @ordered
        @_addOrdered name
      else
        node = @_createNode name
        @$list.append node.html

  insert: (index, name) ->
    return if name in @nodes
    node = @_createNode name
    for nameLi, i in $ 'li', @$list
      if i >= index
        node.html.insertBefore $(nameLi)
        return
    @$list.append node.html

  remove: (name) ->
    if node = @nodes[name]
      node.html.remove()
      delete @nodes[name]

  clear: ->
    @nodes = {}
    @$list.empty()

  addClass: (name, c) ->
    @nodes[name]?.html.addClass(c)

  removeClass: (name, c) ->
    @nodes[name]?.html.removeClass(c)

  clearClasses: ->
    for name of @nodes
      @removeClass node

  replace: (oldName, newName) ->
    if @nodes[oldName]?
      @remove oldName
      @add newName

  rename: (name, text) ->
    @nodes[name]?.html.text(text)

  _addOrdered: (name) ->
    # TODO binary search
    for nameLi in $ 'li', @$list
      if $(nameLi).text() > name
        node = @_createNode name
        node.html.insertBefore $(nameLi)
        return
    node = @_createNode name
    @$list.append node.html

  _createNode: (name) ->
    @nodes[name] = {html: htmlify(name), name: name}
    node = @nodes[name]
    node.html.mousedown( => @_handleClick(node))
    node

  _handleClick: (node) ->
    @emit 'clicked', node.name

htmlify = (name) ->
    $ "<li>#{name}</li>"

exports.HTMLList = HTMLList