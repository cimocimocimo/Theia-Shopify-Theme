'use strict';

import React from 'react';

export class Swatch extends React.Component {

}

export class ColorSwatch extends Swatch {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <div className="option-color-swatch">
                <input
                    type="radio"
                    id={this.props.inputId}
                    name="selected-swatch-color"
                    value={this.props.color}
                    className="input-color"
                    defaultChecked={this.props.isChecked}
                    onChange={this.handleChange} />
                <label className="color-label" htmlFor={this.props.inputId}>
                    <div className="product-image-swatch">
                        <img src={this.props.imgSrc} />
                    </div>
                </label>
            </div>
        );
    }
}

export class SizeSwatch extends Swatch {

}
