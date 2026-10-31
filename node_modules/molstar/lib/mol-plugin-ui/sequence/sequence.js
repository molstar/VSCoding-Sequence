import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { OrderedSet } from '../../mol-data/int';
import { StructureElement, StructureProperties, Unit } from '../../mol-model/structure';
import { Representation } from '../../mol-repr/representation';
import { ButtonsType, getButton, getButtons, getModifiers } from '../../mol-util/input/input-observer';
import { PluginUIComponent } from '../base';
/** Note, if this is changed, the CSS for `msp-sequence-number` needs adjustment too */
const MaxSequenceNumberSize = 5;
// TODO: this is somewhat inefficient and should be done using a canvas.
export class Sequence extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.parentDiv = React.createRef();
        this.lastMouseOverSeqIdx = -1;
        this.highlightQueue = new Subject();
        this.lociHighlightProvider = (loci, action) => {
            const changed = this.props.sequenceWrapper.markResidue(loci.loci, action);
            if (changed)
                this.updateMarker();
        };
        this.lociSelectionProvider = (loci, action) => {
            const changed = this.props.sequenceWrapper.markResidue(loci.loci, action);
            if (changed)
                this.updateMarker();
        };
        this.contextMenu = (e) => {
            e.preventDefault();
        };
        this.mouseDownLoci = undefined;
        this.mouseDown = (e) => {
            e.stopPropagation();
            const seqIdx = this.getSeqIdx(e);
            const loci = this.getLoci(seqIdx);
            const buttons = getButtons(e.nativeEvent);
            const button = getButton(e.nativeEvent);
            const modifiers = getModifiers(e.nativeEvent);
            this.click(loci, buttons, button, modifiers);
            this.mouseDownLoci = loci;
        };
        this.mouseUp = (e) => {
            e.stopPropagation();
            // ignore mouse-up events without a bound loci
            if (this.mouseDownLoci === undefined)
                return;
            const seqIdx = this.getSeqIdx(e);
            const loci = this.getLoci(seqIdx);
            if (loci && !StructureElement.Loci.areEqual(this.mouseDownLoci, loci)) {
                const buttons = getButtons(e.nativeEvent);
                const button = getButton(e.nativeEvent);
                const modifiers = getModifiers(e.nativeEvent);
                const ref = this.mouseDownLoci.elements[0];
                const ext = loci.elements[0];
                const min = Math.min(OrderedSet.min(ref.indices), OrderedSet.min(ext.indices));
                const max = Math.max(OrderedSet.max(ref.indices), OrderedSet.max(ext.indices));
                const range = StructureElement.Loci(loci.structure, [{
                        unit: ref.unit,
                        indices: OrderedSet.ofRange(min, max)
                    }]);
                this.click(StructureElement.Loci.subtract(range, this.mouseDownLoci), buttons, button, modifiers);
            }
            this.mouseDownLoci = undefined;
        };
        this.location = StructureElement.Location.create(void 0);
        this.mouseMove = (e) => {
            e.stopPropagation();
            const buttons = getButtons(e.nativeEvent);
            const button = getButton(e.nativeEvent);
            const modifiers = getModifiers(e.nativeEvent);
            const el = e.target;
            if (!el || !el.getAttribute) {
                if (this.lastMouseOverSeqIdx === -1)
                    return;
                this.lastMouseOverSeqIdx = -1;
                this.highlightQueue.next({ seqIdx: -1, buttons, button, modifiers });
                return;
            }
            const seqIdx = el.hasAttribute('data-seqid') ? +el.getAttribute('data-seqid') : -1;
            if (this.lastMouseOverSeqIdx === seqIdx) {
                return;
            }
            else {
                this.lastMouseOverSeqIdx = seqIdx;
                if (this.mouseDownLoci !== undefined) {
                    const loci = this.getLoci(seqIdx);
                    this.hover(loci, ButtonsType.Flag.None, ButtonsType.Flag.None, { ...modifiers, shift: true });
                }
                else {
                    this.highlightQueue.next({ seqIdx, buttons, button, modifiers });
                }
            }
        };
        this.mouseLeave = (e) => {
            e.stopPropagation();
            this.mouseDownLoci = undefined;
            if (this.lastMouseOverSeqIdx === -1)
                return;
            this.lastMouseOverSeqIdx = -1;
            const buttons = getButtons(e.nativeEvent);
            const button = getButton(e.nativeEvent);
            const modifiers = getModifiers(e.nativeEvent);
            this.highlightQueue.next({ seqIdx: -1, buttons, button, modifiers });
        };
    }
    get sequenceNumberPeriod() {
        if (this.props.sequenceNumberPeriod !== undefined) {
            return this.props.sequenceNumberPeriod;
        }
        if (this.props.sequenceWrapper.length > 10)
            return 10;
        const lastSeqNum = this.getSequenceNumber(this.props.sequenceWrapper.length - 1);
        if (lastSeqNum.length > 1)
            return 5;
        return 1;
    }
    componentDidMount() {
        this.plugin.managers.interactivity.lociHighlights.addProvider(this.lociHighlightProvider);
        this.plugin.managers.interactivity.lociSelects.addProvider(this.lociSelectionProvider);
        this.subscribe(this.highlightQueue.pipe(throttleTime(3 * 16.666, void 0, { leading: true, trailing: true })), (e) => {
            const loci = this.getLoci(e.seqIdx < 0 ? void 0 : e.seqIdx);
            this.hover(loci, e.buttons, e.button, e.modifiers);
        });
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.plugin.managers.interactivity.lociHighlights.removeProvider(this.lociHighlightProvider);
        this.plugin.managers.interactivity.lociSelects.removeProvider(this.lociSelectionProvider);
    }
    getLoci(seqIdx) {
        if (seqIdx !== undefined) {
            const loci = this.props.sequenceWrapper.getLoci(seqIdx);
            if (!StructureElement.Loci.isEmpty(loci))
                return loci;
        }
    }
    getSeqIdx(e) {
        let seqIdx = undefined;
        const el = e.target;
        if (el && el.getAttribute) {
            seqIdx = el.hasAttribute('data-seqid') ? +el.getAttribute('data-seqid') : undefined;
        }
        return seqIdx;
    }
    hover(loci, buttons, button, modifiers) {
        const ev = { current: Representation.Loci.Empty, buttons, button, modifiers };
        if (loci !== undefined && !StructureElement.Loci.isEmpty(loci)) {
            ev.current = { loci };
        }
        this.plugin.behaviors.interaction.hover.next(ev);
    }
    click(loci, buttons, button, modifiers) {
        const ev = { current: Representation.Loci.Empty, buttons, button, modifiers };
        if (loci !== undefined && !StructureElement.Loci.isEmpty(loci)) {
            ev.current = { loci };
        }
        this.plugin.behaviors.interaction.click.next(ev);
    }
    getBackgroundColor(marker) {
        // TODO: make marker color configurable
        if (typeof marker === 'undefined')
            console.error('unexpected marker value');
        return marker === 0
            ? ''
            : marker % 2 === 0
                ? 'rgb(51, 255, 25)' // selected
                : 'rgb(255, 102, 153)'; // highlighted
    }
    getResidueClass(seqIdx, label) {
        return label.length > 1
            ? this.props.sequenceWrapper.residueClass(seqIdx) + (seqIdx === 0 ? ' msp-sequence-residue-long-begin' : ' msp-sequence-residue-long')
            : this.props.sequenceWrapper.residueClass(seqIdx);
    }
    residue(seqIdx, label, marker) {
        return _jsx("span", { "data-seqid": seqIdx, style: { backgroundColor: this.getBackgroundColor(marker) }, className: this.getResidueClass(seqIdx, label), children: `\u200b${label}\u200b` }, seqIdx);
    }
    getSequenceNumberClass(seqIdx, seqNum, label) {
        const classList = ['msp-sequence-number'];
        if (seqNum.startsWith('-')) {
            if (label.length > 1 && seqIdx > 0)
                classList.push('msp-sequence-number-long-negative');
            else
                classList.push('msp-sequence-number-negative');
        }
        else {
            if (label.length > 1 && seqIdx > 0)
                classList.push('msp-sequence-number-long');
        }
        return classList.join(' ');
    }
    getSequenceNumber(seqIdx) {
        let seqNum = '';
        const loci = this.props.sequenceWrapper.getLoci(seqIdx);
        const l = StructureElement.Loci.getFirstLocation(loci, this.location);
        if (l) {
            if (Unit.isAtomic(l.unit)) {
                const seqId = StructureProperties.residue.auth_seq_id(l);
                const insCode = StructureProperties.residue.pdbx_PDB_ins_code(l);
                seqNum = `${seqId}${insCode ? insCode : ''}`;
            }
            else if (Unit.isCoarse(l.unit)) {
                seqNum = `${seqIdx + 1}`;
            }
        }
        return seqNum;
    }
    padSeqNum(n) {
        if (n.length < MaxSequenceNumberSize)
            return n + new Array(MaxSequenceNumberSize - n.length + 1).join('\u00A0');
        return n;
    }
    getSequenceNumberSpan(seqIdx, label) {
        const seqNum = this.getSequenceNumber(seqIdx);
        return _jsx("span", { className: this.getSequenceNumberClass(seqIdx, seqNum, label), children: this.padSeqNum(seqNum) }, `marker-${seqIdx}`);
    }
    updateMarker() {
        if (!this.parentDiv.current)
            return;
        const xs = this.parentDiv.current.children;
        const { markerArray } = this.props.sequenceWrapper;
        const hasNumbers = !this.props.hideSequenceNumbers, period = this.sequenceNumberPeriod;
        // let first: HTMLSpanElement | undefined;
        let o = 0;
        for (let i = 0, il = markerArray.length; i < il; i++) {
            if (hasNumbers && i % period === 0 && i < il)
                o++;
            // o + 1 to account for help icon
            const span = xs[o];
            if (!span)
                return;
            o++;
            // if (!first && markerArray[i] > 0) {
            //     first = span;
            // }
            const backgroundColor = this.getBackgroundColor(markerArray[i]);
            if (span.style.backgroundColor !== backgroundColor)
                span.style.backgroundColor = backgroundColor;
        }
        // if (first) {
        //     first.scrollIntoView({ block: 'nearest' });
        // }
    }
    render() {
        const sw = this.props.sequenceWrapper;
        const elems = [];
        const hasNumbers = !this.props.hideSequenceNumbers, period = this.sequenceNumberPeriod;
        for (let i = 0, il = sw.length; i < il; ++i) {
            const label = sw.residueLabel(i);
            // add sequence number before name so the html element do not get separated by a line-break
            if (hasNumbers && i % period === 0 && i < il) {
                elems[elems.length] = this.getSequenceNumberSpan(i, label);
            }
            elems[elems.length] = this.residue(i, label, sw.markerArray[i]);
        }
        // calling .updateMarker here is neccesary to ensure existing
        // residue spans are updated as react won't update them
        this.updateMarker();
        return _jsx("div", { className: 'msp-sequence-wrapper', onContextMenu: this.contextMenu, onMouseDown: this.mouseDown, onMouseUp: this.mouseUp, onMouseMove: this.mouseMove, onMouseLeave: this.mouseLeave, ref: this.parentDiv, children: elems });
    }
}
