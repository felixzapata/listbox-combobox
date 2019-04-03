# \<listbox-combobox\>

Web component based on the [ARIA 1.1 Combobox with Listbox Popup Examples](https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html).

```html
  <listbox-combobox search-fn="{{searchFn}}" label="my awesome label" id="demo1" should-auto-select></listbox-combobox>
```

## TO-DO

+ Add tests.
+ Add custom CSS properties.

## Properties

### shouldAutoSelect
Type: `Boolean`

Default: false

It allows the user to choose the suggested option or not.

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) and npm (packaged with [Node.js](https://nodejs.org)) installed. Run `npm install` to install your element's dependencies, then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```