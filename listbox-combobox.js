/**
 * `listbox-combobox`
 * Polymer component based on the ARIA 1.1 Combobox with Listbox Popup Examples
 * https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html
 *
 */
import { LitElement, html } from 'lit-element';

class ListboxCombobox extends LitElement {
  static get is() { return 'listbox-combobox'; }

  static get properties() {
    return {
      label: String,
      selected: {
        type: String,
        notify: true
      },
      shouldAutoSelect: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      searchFn: Function,
      onShow: Function,
      onHide: Function,
      activeIndex: {
        type: Number,
        value: -1
      },
      resultsCount: {
        type: Number,
        value: 0
      },
      shown: {
        type: Boolean,
        value: false
      },
      hasInlineAutocomplete: {
        type: Boolean,
        value: false
      }
    };
  }

  render() {
    return html`
    :host {
      display: flex;
      position: relative;
      z-index: 1;

      --combobox-label: {
        font-size: 14px;
        font-weight: bold;
        margin-right: 5px;
      }
      --combobox-wrapper: {
        width: 300px;
        height: 40px;
      };
      --combobox-result-separator: #ccd3d7;
      --combobox-focused-background: #00c0b5;
      --combobox-focused-color: #fff;
      --combobox-focused-background-hover: rgba(0, 192, 182, 0.5);
      --combobox-focused-color-hover: #191919;

      @apply --combobox-host;
    }

    .hidden {
      display: none;
    }

    .combobox-label {
      @apply --combobox-label;
    }
    .combobox-wrapper {
      display: flex;
      position: relative;
      @apply --combobox-wrapper;
    }
      .combobox-wrapper div {
        width: 100%;
        height: 100%;
      }
      .combobox-wrapper input {
        width: 100%;
        height: 100%;
        border: 1px solid #191919;
        padding: 8px 20px;
        box-sizing: border-box;
        border-radius: 4px;
        background: #fff;
        outline: none;
        @apply --combobox-input;
      }

    .listbox {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      max-height: 200px;
      margin: 0;
      padding: 0;
      list-style: none;
      list-style-image: none;
      background: #fff;;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      overflow-y: auto;
      @apply --combobox-listbox;
    }
    .listbox .result {
      padding: 10px;
      font: 400 18px/1 Arial;
      color: #191919;
      @apply --combobox-result;
    }
    .listbox .result + .result {
      border-top: 1px solid var(--combobox-result-separator);
    }

    .listbox .result:hover {
      background: var(--combobox-focused-background-hover);
      color: var(--combobox-focused-color-hover);
    }
    .listbox .focused {
      background: var(--combobox-focused-background);
      color: var(--combobox-focused-color);
    }
    <label for="ex1-input" id="ex1-label" class="combobox-label">${this.value}</label>
    <div class="combobox-wrapper">
      <div role="combobox" aria-expanded="false" aria-owns="ex1-listbox" aria-haspopup="listbox" id="ex1-combobox">
        <input type="text" aria-autocomplete="list" aria-controls="ex1-listbox" id="ex1-input">
      </div>
      <ul aria-labelledby="ex1-label" role="listbox" id="ex1-listbox" class="listbox hidden">
      </ul>
    </div>
  `;
  }

  constructor() {
    super();
    this.onShow = function () { };
    this.onHide = function () { };
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

  connectedCallback() {
    super.connectedCallback();
    this.combobox = this.shadowRoot.querySelector('#ex1-combobox');
    this.input = this.shadowRoot.querySelector('#ex1-input');
    this.listbox = this.shadowRoot.querySelector('#ex1-listbox');
    this.set('hasInlineAutocomplete', this.input.getAttribute('aria-autocomplete') === 'both');
    this.setupEvents();
  }

  setupEvents() {
    document.body.addEventListener('click', this.checkHide.bind(this));
    this.input.addEventListener('keyup', this.checkKey.bind(this));
    this.input.addEventListener('keydown', this.setActiveItem.bind(this));
    this.input.addEventListener('focus', this.checkShow.bind(this));
    this.input.addEventListener('blur', this.checkSelection.bind(this));
    this.listbox.addEventListener('click', this.clickItem.bind(this));
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

  updateResults(shouldShowAll) {
    var searchString = this.input.value;
    var results = this.searchFn(searchString);

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
      this.onShow();
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
      this.set('selected', this.input.value);
      this.input.value = '';
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
    this.onHide();
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

window.customElements.define(ListboxCombobox.is, ListboxCombobox);
