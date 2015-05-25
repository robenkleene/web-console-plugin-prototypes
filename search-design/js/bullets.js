var Bullets = {
  // Constants

  NEXT_OFFSET: 1,
  PREVIOUS_OFFSET: -1,


  // Properties

  rootElement: null,
  get rootNode() {
    return this.rootElement || document.body;
  },
  selectedClass: 'bullets-selected',
  collapsedClass: 'bullets-collapsed',
  headerTags: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
  hierarchicalTags: ['LI'],
  followTags: ['A'],
  get selectTags() {
    return this.headerTags.concat(this.hierarchicalTags);
  },
  get selectedNodes() {
    return this.rootNode.getElementsByClassName(this.selectedClass);
  },


  // Public

  selectNext: function() {
    var elementToSelect = this.visibleSelectableElementFromOffset(this.NEXT_OFFSET);
    if (!elementToSelect) {
      this.nothingToSelect();
      return;
    }
    this.selectElement(elementToSelect);
  },
  selectPrevious: function() {
    var elementToSelect = this.visibleSelectableElementFromOffset(this.PREVIOUS_OFFSET);
    if (!elementToSelect) {
      this.nothingToSelect();
      return;
    }
    this.selectElement(elementToSelect);
  },
  deselectElement: function(element) {
    if (!!element) {
      element.classList.remove(this.selectedClass);
    }
  },
  deselectAll: function() {
    var nodeList = this.selectedNodes;
    for (var i = nodeList.length - 1; i >= 0; --i) {
      var element = nodeList[i];
      element.classList.remove(this.selectedClass);
    }
  },

  toggleCollapseSelection: function() {
    var nodeList = this.selectedNodes;
    if (nodeList.length < 1) {
      this.nothingToCollapse();
      return;
    }

    for (var i = nodeList.length - 1; i >= 0; --i) {
      var element = nodeList[i];
      if(this.elementIsCollapsed(element)) {
        this.expandElement(element);
      } else {
        this.collapseElement(element);
      }
    }
  },

  collapseSelection: function() {
    var nodeList = this.selectedNodes;
    var elementsToCollapse = Array.prototype.filter.call(nodeList, function(node) {
      return !this.elementIsCollapsed(node);
    }.bind(this));

    if (elementsToCollapse.length < 1) {
      this.nothingToCollapse();
      return;
    }

    for (var i = 0; i < elementsToCollapse.length; i++) {
      var element = elementsToCollapse[i];
      this.collapseElement(element);
    }
  },

  expandSelection: function() {
    var nodeList = this.selectedNodes;
    var elementsToExpand = Array.prototype.filter.call(nodeList, function(node) {
      return this.elementIsCollapsed(node);
    }.bind(this));

    if (elementsToExpand.length < 1) {
      this.nothingToExpand();
      return;
    }

    for (var i = 0; i < elementsToExpand.length; i++) {
      var element = elementsToExpand[i];
      this.expandElement(element);
    }
  },

  expandAll: function() {
    var nodeList = this.rootNode.getElementsByClassName(this.collapsedClass);
    for (var i = nodeList.length - 1; i >= 0; --i) {
      var element = nodeList[i];
      this.expandElement(element);
    }
  },


  // Private

  elementIsCollapsed: function(element) {
    if (!element) {
      return false;
    }
    return element.classList.contains(this.collapsedClass);
  },

  followSelection: function() {
    var nodeList = this.selectedNodes;
    if (nodeList.length < 1) {
      this.nothingToFollow();
      return;
    }

    for (var i = nodeList.length - 1; i >= 0; --i) {
      var element = nodeList[i];
      var followTagsNodeList = element.querySelectorAll(this.followTags);
      for (var j = 0; j < followTagsNodeList.length; j++) {
        var followTag = followTagsNodeList[j];
        if (followTag.hasAttribute('href')) {
          var address = followTag.getAttribute('href');
          this.redirect(address);
          return;
        }
      }
    }

    this.nothingToFollow();
    return;
  },

  redirect: function(address) {
    window.location = address;
  },

  selectElement: function(element) {
    this.deselectAll();
    if (!!element) {
      element.classList.add(this.selectedClass);
      if (!this.elementIsScrolledIntoView(element)) {
        element.scrollIntoView();
      }
    }
  },

  collapseElement: function(element) {
    if (!element) {
      return;
    }

    element.classList.add(this.collapsedClass);
  },
  expandElement: function(element) {
    if (!element) {
      return;
    }

    element.classList.remove(this.collapsedClass);
  },

  elementIsScrolledIntoView: function(element) {
      var top = element.getBoundingClientRect().top;
      var bottom = element.getBoundingClientRect().bottom;
      var isVisible = (top >= 0) && (bottom <= window.innerHeight);
      return isVisible;
  },


  // Selection

  visibleSelectableElementFromOffset: function(offset) {
    var selectedNodeList = this.selectedNodes;
    var selectedElement;

    if (selectedNodeList.length < 1) {
      var selectableNodeList = this.rootNode.querySelectorAll(this.selectTags);
      if (selectableNodeList.length < 1) {
        // No selectable nodes
        return null;
      }

      var selectableIndex = offset > 0 ? 0 : selectableNodeList.length - 1;
      selectedElement = selectableNodeList[selectableIndex];
      if (this.elementIsVisible(selectedElement)) {
        // If there's no existing selection return the first or last element if it's visible
        return selectedElement;
      }
    }

    var selectedIndex = offset > 0 ? 0 : selectedNodeList.length - 1;
    selectedElement = selectedNodeList[selectedIndex];

    if (offset < 0) {
      return this.findPreviousVisibleSelectableElement(selectedElement);
    } else {
      return this.findNextVisibleSelectableElement(selectedElement);
    }
  },

  // Next

  findNextVisibleSelectableElement: function(element) {
    var offset = this.NEXT_OFFSET;

    var selectableDescendant = this.selectableDescendant(element, offset);
    if (!!this.elementIsVisible(selectableDescendant)) {
      return selectableDescendant;
    }

    var nextVisibleSibling = this.visibleSibling(element, offset);
    if (!!nextVisibleSibling) {
      if (this.elementIsSelectable(nextVisibleSibling)) {
        return nextVisibleSibling;
      }

      var nextElement = this.selectableDescendant(nextVisibleSibling, offset);

      if (!!nextElement) {
        if (this.elementIsVisible(nextElement)) {
          return nextElement;
        }
      } else {
        nextElement = nextVisibleSibling;
      }
      return this.findNextVisibleSelectableElement(nextElement);
    }


    if (element.parentNode == this.rootNode) {
      // If there are no previous visible siblings, and the parent is the root node
      // then there's nothing to select.
      // This should really never happen because the first child of the root node
      // should never be hidden, but this can prevent infinite loops in buggy conditions
      return null;
    }

    var ancestorSiblingWithVisibleParent = this.ancestorSiblingWithVisibleParent(element);
    if (!!ancestorSiblingWithVisibleParent) {

      if (this.elementIsVisibleSelectable(ancestorSiblingWithVisibleParent)) {
        return ancestorSiblingWithVisibleParent;
      }

      var selectableDescendant = this.selectableDescendant(ancestorSiblingWithVisibleParent, offset);
      if (!!selectableDescendant && this.elementIsVisible(selectableDescendant)) {
        return selectableDescendant;
      }

      return this.findNextVisibleSelectableElement(ancestorSiblingWithVisibleParent);
    }

    return null;
  },

  ancestorSiblingWithVisibleParent: function(element) {
    while(element.parentNode) {

      if (element.parentNode == this.rootNode) {
        return null;
      }

      element = element.parentNode;
      if (this.elementIsVisible(element.parentNode)) {
        var sibling = element.nextElementSibling;
        if (!!sibling) {
          return sibling;
        }
      }
    }

    return null;
  },

  // Previous

  findPreviousVisibleSelectableElement: function(element) {
    var offset = this.PREVIOUS_OFFSET;
    var previousVisibleSibling = this.visibleSibling(element, offset);

    if (!!previousVisibleSibling) {
      var previousElement = this.selectableDescendant(previousVisibleSibling, offset);

      if (!!previousElement) {
        if (this.elementIsVisible(previousElement)) {
          return previousElement;
        }
      } else {
        if (this.elementIsSelectable(previousVisibleSibling)) {
          return previousVisibleSibling;
        }
        previousElement = previousVisibleSibling;
      }

      return this.findPreviousVisibleSelectableElement(previousElement);
    }

    if (element.parentNode == this.rootNode) {
      // If there are no previous visible siblings, and the parent is the root node
      // then there's nothing to select.
      // This should really never happen because the first child of the root node
      // should never be hidden, but this can prevent infinite loops in buggy conditions
      return null;
    }

    var ancestorWithVisibleParent = this.ancestorWithVisibleParent(element);
    if (!!ancestorWithVisibleParent) {
      if (this.elementIsVisibleSelectable(ancestorWithVisibleParent)) {
        return ancestorWithVisibleParent;
      }

      return this.findPreviousVisibleSelectableElement(ancestorWithVisibleParent);
    }

    return null;
  },

  ancestorWithVisibleParent: function(element) {
    while(element.parentNode) {


      if (element.parentNode == this.rootNode) {
        return element;
      }

      element = element.parentNode;

      if (this.elementIsVisible(element.parentNode)) {
        return element;
      }
    }

    return null;
  },

  // Next & Previous

  visibleSibling: function(element, offset) {
    var sibling = offset > 0 ? 'nextElementSibling' : 'previousElementSibling';

    while(element[sibling]) {
      element = element[sibling];

      if (this.elementIsVisible(element)) {
        return element;
      }
    }

    return null;
  },

  selectableDescendant: function(element, offset) {
    var selectableDescendants = element.querySelectorAll(this.selectTags);

    if (selectableDescendants.length < 1) {
      return null;
    }

    var index = offset > 0 ? 0 : selectableDescendants.length - 1;
    return selectableDescendants[index];
  },

  elementIsVisibleSelectable: function(element) {
    return this.elementIsSelectable(element) && this.elementIsVisible(element);
  },

  elementIsSelectable: function(element) {
    if (element == this.rootNode) {
      return false;
    }
    var tagName = element.tagName;
    return this.selectTags.indexOf(tagName) >= 0;
  },

  elementIsVisible: function(element) {
    if (!element) {
      return false;
    }
    if (element === this.rootNode) {
      // Always consider the rootNode visible
      return true;
    }
    return element.offsetParent !== null;
  },


  // Nothing to do

  nothingToFollow: function() {
    this.beep("Nothing to follow");
  },

  nothingToSelect: function() {
    this.beep("Nothing to select");
  },

  nothingToCollapse: function() {
    this.beep("Nothing to collapse");
  },

  nothingToExpand: function() {
    this.beep("Nothing to expand");
  },

  beep: function(message) {
    // TODO Beep or visual bell
    console.log(message);
  }
};
