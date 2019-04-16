# \<listbox-combobox\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/listbox-combobox)

LitElement component based on the [ARIA 1.1 Combobox with Listbox Popup Examples](https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html).

```html
  <listbox-combobox label="my awesome label" id="demo1" should-auto-select></listbox-combobox>
```

## Installation

```sh
$ npm install listbox-combobox --save
```

## TO-DO

+ Add tests.
+ Add custom CSS properties.

## Properties

### shouldAutoSelect
Type: `Boolean`

Default: false

It allows the user to choose the suggested option or not.

### items
Type: `Array`

Default: []

Items to show and filter