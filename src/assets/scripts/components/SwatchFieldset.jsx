'use strict';

import React from 'react';

import {ColorSwatch} from './Swatch.jsx';

export class SwatchFieldset extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            legend: {
                label: "Colour",
                value: this.props.swatches[0].color
            },
            swatches: [],
            selectedColor: this.props.swatches[0].color
        };

        this.handleColorChange = this.handleColorChange.bind(this);
    }

    handleColorChange(color){
        console.log(color);

        this.setState({
            legend: {value: color},
            selectedColor: color
        });

        window.jQuery('body').trigger('colorChanged.productPage', {
            color: color
        });
    }

    render() {
        return (
            <fieldset className="option-color-swatches js-color-swatch-field">
                <FieldsetLegend
                    label={this.props.legendLabel}
                    value={this.state.legend.value} />
                <div className="swatch-container">{this.props.swatches.map(
                        (swatch, index) =>
                        <ColorSwatch
                                inputId={swatch.color}
                                color={swatch.color}
                                onChange={this.handleColorChange}
                                isChecked={index === 0}
                                imgSrc={swatch.src}
                                key={swatch.key} />
                )}</div>
            </fieldset>
        );
    }
}

class FieldsetLegend extends React.Component {
    render() {
        return (
            <legend>
                {this.props.label}:
                <span className="selected-swatch-value">{this.props.value}</span>
            </legend>
        );
    }
}
