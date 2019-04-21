import { html, LitElement } from 'lit-element';
import {listboxComboboxStyle} from './listbox-combobox.style.js';

export default class ListboxCombobox extends LitElement {

  static get properties() {
    return {
      activeIndex: { type: Number },
      hasInlineAutocomplete: { type: Boolean },
      items: { type: Array },
      label: { type: String },
      resultsCount: { type: Number },
      selected: { type: String },
      shouldAutoSelect: {
        attribute: 'should-auto-select',
        type: Boolean,
        reflect: true
      },
      shown: { type: Boolean }
    };
  }

  render() {
    return html`
    <style>${listboxComboboxStyle}</style>
    <label for="ex1-input" id="ex1-label" class="combobox-label">${this.label}</label>
    <div class="combobox-wrapper">
      <div role="combobox" aria-expanded="false" aria-owns="ex1-listbox" aria-haspopup="listbox" id="ex1-combobox">
        <input type="text"
          @keyup="${this.checkKeyHandler}"
          @keydown="${this.setActiveItemHandler}"
          @focus="${this.checkShowHandler}"
          @blur="${this.checkSelectionHandler}"
        aria-autocomplete="list" aria-controls="ex1-listbox" id="ex1-input">
      </div>
      <ul aria-labelledby="ex1-label" role="listbox" id="ex1-listbox" class="listbox hidden" @click="${this.clickItemHandler}"></ul>
    </div>
  `;
  }


  constructor() {
    super();
    this.shouldAutoSelect = false;
    this.items = [];
    this.resultsCount = 0;
    this.activeIndex = -1;

    this.KeyCode = {
      BACKSPACE: 8,
      TAB: 9,
      RETURN: 13,
      ESC: 27,
      SPACE: 32,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      DELETE: 46
    };
  }

  setupEvents() {
    this.checkHideHandler = this.checkHide.bind(this);
    this.checkKeyHandler = this.checkKey.bind(this);
    this.setActiveItemHandler = this.setActiveItem.bind(this);
    this.checkShowHandler = this.checkShow.bind(this);
    this.checkSelectionHandler = this.checkSelection.bind(this);
    this.clickItemHandler = this.clickItem.bind(this);
    document.body.addEventListener('click', this.checkHideHandler);
  }

  firstUpdated() {
    this.combobox = this.shadowRoot.querySelector('#ex1-combobox');
    this.input = this.shadowRoot.querySelector('#ex1-input');
    this.listbox = this.shadowRoot.querySelector('#ex1-listbox');
    this.hasInlineAutocomplete = this.input.getAttribute('aria-autocomplete') === 'both';
    this.setupEvents();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.removeEventListener('click', this.checkHideHandler);
  }

  checkKey(evt) {
    var key = evt.which || evt.keyCode;

    switch (key) {
      case this.KeyCode.UP:
      case this.KeyCode.DOWN:
      case this.KeyCode.ESC:
      case this.KeyCode.RETURN:
        evt.preventDefault();
        return;
      default:
        this.updateResults(false);
    }

    if(this.hasInlineAutocomplete) {
      switch (key) {
        case this.KeyCode.BACKSPACE:
          return;
        default:
          this.autocompleteItem();
      }
    }
  }

  search(searchString) {
    var callback = function(item) {
      return item.toLowerCase().indexOf(searchString.toLowerCase()) === 0;
    };
    var returnValue = function(item) {
      return item;
    }
    return this.items.filter(callback).map(returnValue);
  }

  updateResults(shouldShowAll) {
    var searchString = this.input.value;
    var results = this.search(searchString);

    this.hideListbox();

    if(!shouldShowAll && !searchString) {
      results = [];
    }

    if(results.length) {
      for(var i = 0; i < results.length; i++) {
        var resultItem = document.createElement('li');
        resultItem.className = 'result';
        resultItem.setAttribute('role', 'option');
        resultItem.setAttribute('id', 'result-item-' + i);
        resultItem.innerText = results[i];
        if(this.shouldAutoSelect && i === 0) {
          resultItem.setAttribute('aria-selected', 'true');
          resultItem.classList.add('focused');
          this.activeIndex = 0;
        }
        this.listbox.appendChild(resultItem);
      }
      this.listbox.classList.remove('hidden');
      this.combobox.setAttribute('aria-expanded', 'true');
      this.resultsCount = results.length;
      this.shown = true;
    }
  }

  setActiveItem(evt) {
    var key = evt.which || evt.keyCode;
    // eslint-disable-next-line
    var activeIndex = this.activeIndex;

    if(key === this.KeyCode.ESC) {
      this.hideListbox();
      setTimeout((function () {
        // On Firefox, input does not get cleared here unless wrapped in
        // a setTimeout
        this.input.value = '';
      }).bind(this), 1);
      return;
    }
    if(this.resultsCount < 1) {
      if(this.hasInlineAutocomplete && (key === this.KeyCode.DOWN || key === this.KeyCode.UP)) {
        this.updateResults(true);
      } else {
        return;
      }
    }

    var prevActive = this.getItemAt(activeIndex);
    var activeItem;

    switch (key) {
      case this.KeyCode.UP:
        if(activeIndex <= 0) {
          activeIndex = this.resultsCount - 1;
        } else {
          activeIndex--;
        }
        break;
      case this.KeyCode.DOWN:
        if(activeIndex === -1 || activeIndex >= this.resultsCount - 1) {
          activeIndex = 0;
        } else {
          activeIndex++;
        }
        break;
      case this.KeyCode.RETURN:
        activeItem = this.getItemAt(activeIndex);
        this.selectItem(activeItem);
        return;
      case this.KeyCode.TAB:
        this.checkSelection();
        this.hideListbox();
        return;
      default:
        return;
    }

    evt.preventDefault();

    activeItem = this.getItemAt(activeIndex);
    this.activeIndex = activeIndex;
    if(prevActive) {
      prevActive.classList.remove('focused');
      prevActive.setAttribute('aria-selected', 'false');
    }

    if(activeItem) {
      this.input.setAttribute(
        'aria-activedescendant',
        'result-item-' + activeIndex
      );
      activeItem.classList.add('focused');
      activeItem.setAttribute('aria-selected', 'true');
      if(this.hasInlineAutocomplete) {
        this.input.value = activeItem.innerText;
      }
    } else {
      this.input.setAttribute(
        'aria-activedescendant',
        ''
      );
    }
  }

  getItemAt(index) {
    return this.shadowRoot.querySelector('#result-item-' + index);
  }

  clickItem(evt) {
    if(evt.target && evt.target.nodeName === 'LI') {
      this.selectItem(evt.target);
    }
  }

  selectItem(item) {
    if(item) {
      this.input.value = item.innerText;
      this.selected = this.input.value;
      this.input.value = '';
      this.dispatchEvent(new window.CustomEvent('value-changed', { composed:true, bubbles: true, detail: this.selected }));
      this.hideListbox();
    }
  }

  checkShow() {
    this.updateResults(false);
  }

  checkHide(evt) {
    if(evt.target === this.input || this.combobox.contains(evt.target)) {
      return;
    }
    this.hideListbox();
  }

  hideListbox() {
    this.shown = false;
    this.activeIndex = -1;
    this.listbox.innerHTML = '';
    this.listbox.classList.add('hidden');
    this.combobox.setAttribute('aria-expanded', 'false');
    this.resultsCount = 0;
    this.input.setAttribute(
      'aria-activedescendant',
      ''
    );
  }

  checkSelection() {
    if(this.activeIndex < 0) {
      return;
    }
    var activeItem = this.getItemAt(this.activeIndex);
    this.selectItem(activeItem);
  }

  autocompleteItem() {
    var autocompletedItem = this.listbox.querySelector('.focused');
    var inputText = this.input.value;
    var autocomplete;

    if(!autocompletedItem || !inputText) {
      return;
    }

    autocomplete = autocompletedItem.innerText;
    if(inputText !== autocomplete) {
      this.input.value = autocomplete;
      this.input.setSelectionRange(inputText.length, autocomplete.length);
    }
  }
}

