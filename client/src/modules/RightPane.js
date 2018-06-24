import React from "react"
import PropTypes from "prop-types"
import {
    Values,
    STROKE_FEATURES,
    ANGIO_FEATURES,
    DEGENERATIVE_FEATURES
} from "./App"

const StrokeFeaturePropTypes = PropTypes.shape({
    id: PropTypes.number,
    report_uid: PropTypes.number,
    kind: PropTypes.string,
    temporal: PropTypes.string,
    location: PropTypes.string,
    side: PropTypes.string,
    extent: PropTypes.string
})

const AngioFeaturePropTypes = PropTypes.shape({
    id: PropTypes.number,
    report_uid: PropTypes.number,
    vessel: PropTypes.string,
    side: PropTypes.string,
    finding: PropTypes.string
})

const DegenerativeFeaturePropTypes = PropTypes.shape({
    id: PropTypes.number,
    report_uid: PropTypes.number,
    cortical_atrophy: PropTypes.string,
    cortical_atrophy_description: PropTypes.string,
    central_atrophy: PropTypes.string,
    microangiopathy: PropTypes.string
})

const RadiologyPropTypes = PropTypes.shape({
    pid: PropTypes.number,
    eid: PropTypes.number,
    order_uid: PropTypes.number,
    examination: PropTypes.string,
    request: PropTypes.string,
    ordered_at: PropTypes.string,
    discipline: PropTypes.string,
    report_uid: PropTypes.number,
    comment: PropTypes.string,
    examination_started_at: PropTypes.string,
    report_type: PropTypes.string,
    report: PropTypes.string
})

const ValuesPropTypes = PropTypes.shape({
    Locations: PropTypes.arrayOf(PropTypes.string),
    Kind: PropTypes.arrayOf(PropTypes.string),
    Temporal: PropTypes.arrayOf(PropTypes.string),
    Side: PropTypes.arrayOf(PropTypes.string),
    Extent: PropTypes.arrayOf(PropTypes.string),
    Grade: PropTypes.arrayOf(PropTypes.string),
    Vessels: PropTypes.arrayOf(PropTypes.string),
    VesselFinding: PropTypes.arrayOf(PropTypes.string),
    CorticalAtrophyDescription: PropTypes.arrayOf(PropTypes.string)
})

const StrokeFeature = ({feature, selected, selectFeature}) => {
    const {id, report_uid, kind, temporal, location, side, extent} = feature
    return (
        <div className={selected.id === feature.id ? "row feature selected" : "row feature"}
             onClick={selectFeature}>
            <div className='col-12'>
                <ul>
                    <li><span>kind: </span>{kind}</li>
                    <li><span>temporal: </span>{temporal}</li>
                    <li><span>location: </span>{location}</li>
                    <li><span>side: </span>{side}</li>
                    <li><span>extent: </span>{extent}</li>
                </ul>
            </div>
        </div>
    )
}

StrokeFeature.propTypes = {
    selected: PropTypes.object,
    feature: PropTypes.shape({id: PropTypes.number}),
    selectFeature: PropTypes.func
}

const AngioFeature = ({feature, selected, selectFeature}) => {
    const {id, report_uid, vessel, side, finding} = feature
    return (
        <div className={selected.id === feature.id ? "row feature selected" : "row feature"}
             onClick={selectFeature}>
            <div className='col-12'>
                <ul>
                    <li><span>finding: </span>{finding}</li>
                    <li><span>vessel: </span>{vessel}</li>
                    <li><span>side: </span>{side}</li>
                </ul>
            </div>
        </div>
    )
}

AngioFeature.propTypes = {
    feature: PropTypes.shape({id: PropTypes.number}),
    selected: PropTypes.shape({id: PropTypes.number}),
    selectFeature: PropTypes.func
}

const DegenerativeFeature = ({feature, selected, selectFeature}) => {
    const {cortical_atrophy, cortical_atrophy_description, central_atrophy, microangiopathy} = feature
    return (
        <div className={selected.id === feature.id ? "row feature selected" : "row feature"}
             onClick={selectFeature}>
            <div className='col-12'>
                <ul>
                    <li><span>cortical_atrophy: </span>{cortical_atrophy}</li>
                    <li><span>cortical_atrophy_description: </span>{cortical_atrophy_description}</li>
                    <li><span>central_atrophy: </span>{central_atrophy}</li>
                    <li><span>microangiopathy: </span>{microangiopathy}</li>
                </ul>
            </div>
        </div>
    )
}

DegenerativeFeature.propTypes = {
    feature: PropTypes.shape({id: PropTypes.number}),
    selected: PropTypes.shape({id: PropTypes.number}),
    selectFeature: PropTypes.func
}

const StrokeFeatures = ({features, selected, selectFeature}) => features && features.map(f =>
    <StrokeFeature key={f.id} feature={f}
                   selectFeature={selectFeature.bind(null, f)}
                   selected={selected}/>) || null

StrokeFeatures.propTypes = {
    features: PropTypes.array
}

const AngioFeatures = ({features, selected, selectFeature}) => features && features.map(f =>
    <AngioFeature key={f.id} feature={f}
                  selectFeature={selectFeature.bind(null, f)}
                  selected={selected}/>) || null

AngioFeatures.propTypes = {
    features: PropTypes.array
}

const DegenerativeFeatures = ({features, selected, selectFeature}) => {
    return features && features.map(f =>
        <DegenerativeFeature key={f.id} feature={f}
                             selectFeature={selectFeature.bind(null, f)}
                             selected={selected}/>) || null
}

DegenerativeFeatures.propTypes = {
    features: PropTypes.array
}

const StrokeFeatureEditor = ({feature, onFeatureChange, values}) => {
    const vm = JSON.parse(JSON.stringify(feature))
    const {id, report_uid, kind, temporal, location, side, extent} = vm
    return (
        <div className='col-12'>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <ul>
                        <li className='id'><span>id: </span>{id}</li>
                        <li className='report-uid'><span>report_uid: </span>{report_uid}</li>
                    </ul>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Kind: </span>
                    <select value={kind} onChange={onFeatureChange.bind(null, "kind", vm)}>
                        {Values.Kind.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Temporal: </span>
                    <select value={temporal} onChange={onFeatureChange.bind(null, "temporal", vm)}>
                        {Values.Temporal.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Location: </span>
                    <select value={location} onChange={onFeatureChange.bind(null, "location", vm)}>
                        {Values.Locations.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Side: </span>
                    <select value={side} onChange={onFeatureChange.bind(null, "side", vm)}>
                        {Values.Side.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Extent: </span>
                    <select value={extent} onChange={onFeatureChange.bind(null, "extent", vm)}>
                        {Values.Extent.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}

StrokeFeatureEditor.propTypes = {
    feature: StrokeFeaturePropTypes,
    onFeatureChange: PropTypes.func,
    values: ValuesPropTypes
}

const AngioFeatureEditor = ({feature, onFeatureChange, values}) => {
    const vm = JSON.parse(JSON.stringify(feature))
    const {id, report_uid, vessel, side, finding} = vm
    return (
        <div className='col-12'>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <ul>
                        <li className='id'><span>id: </span>{id}</li>
                        <li className='radiology-id'><span>report_uid: </span>{report_uid}</li>
                    </ul>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Finding: </span>
                    <select value={finding} onChange={onFeatureChange.bind(null, "finding", vm)}>
                        {Values.VesselFinding.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Vessel: </span>
                    <select value={vessel} onChange={onFeatureChange.bind(null, "vessel", vm)}>
                        {Values.Vessels.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Side: </span>
                    <select value={side} onChange={onFeatureChange.bind(null, "side", vm)}>
                        {Values.Side.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}

AngioFeatureEditor.propTypes = {
    feature: AngioFeaturePropTypes,
    onFeatureChange: PropTypes.func,
    values: ValuesPropTypes
}

const DegenerativeFeatureEditor = ({feature, onFeatureChange, values}) => {
    const vm = JSON.parse(JSON.stringify(feature))
    const {id, report_uid, cortical_atrophy, cortical_atrophy_description, central_atrophy, microangiopathy} = vm
    return (
        <div className='col-12'>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <ul>
                        <li><span className='id'>id: </span>{id}</li>
                        <li><span className='radiology-id'>report_uid: </span>{report_uid}</li>
                    </ul>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Cortical atrophy: </span>
                    <select value={cortical_atrophy} onChange={onFeatureChange.bind(null, "cortical_atrophy", vm)}>
                        {Values.Grade.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Cortical atrophy description: </span>
                    <select value={cortical_atrophy_description}
                            onChange={onFeatureChange.bind(null, "cortical_atrophy_description", vm)}>
                        {Values.CorticalAtrophyDescription.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Central atrophy: </span>
                    <select value={central_atrophy} onChange={onFeatureChange.bind(null, "central_atrophy", vm)}>
                        {Values.Grade.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            <div className='row edit-feature'>
                <div className='col-12'>
                    <span>Microangiopathy: </span>
                    <select value={microangiopathy} onChange={onFeatureChange.bind(null, "microangiopathy", vm)}>
                        {Values.Grade.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}

DegenerativeFeatureEditor.propTypes = {
    feature: DegenerativeFeaturePropTypes,
    onFeatureChange: PropTypes.func,
    values: ValuesPropTypes
}

export default class RightPane extends React.Component {
    render() {
        const { SelectedRadiology, SelectedFeatures } = this.props

        if (!SelectedFeatures || !SelectedRadiology) {
            return null
        }

        const {report_uid, eid, pid, request, ordered_at, report} = SelectedRadiology
        const selectedFeatures = this.props.SelectedFeatures
        return (
            <div className='col-xs-6 col-sm-6 col-md-7 col-lg-8 col-xl-9' id='right-pane'>
                <div className='row'>
                    <div className='col-12' id='radiology-info'>
                        <ul>
                            <li><span>pid: </span>{pid}</li>
                            <li><span>report_uid: </span>{report_uid}</li>
                            <li><span>eid: </span>{eid}</li>
                            <li><span>ordered_at: </span>{ordered_at}</li>
                            <li><span>request: </span>{request}</li>
                        </ul>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>{report}</div>
                </div>

                <div className='row' id='right-pane-vertical-separator'>
                    <div className='col-12'>
                        <hr/>
                    </div>
                </div>

                <div className='row'>
                    <div
                        className={this.props.SelectedFeatures === STROKE_FEATURES ? "col-4 feature-selector selected" : "col-4 feature-selector"}
                        onClick={this.props.selectStroke}>Stroke features
                    </div>
                    <div
                        className={this.props.SelectedFeatures === ANGIO_FEATURES ? "col-4 feature-selector selected" : "col-4 feature-selector"}
                        onClick={this.props.selectAngio}>Angio features
                    </div>
                    <div
                        className={this.props.SelectedFeatures === DEGENERATIVE_FEATURES ? "col-4 feature-selector selected" : "col-4 feature-selector"}
                        onClick={this.props.selectDegenerative}>Degenerative features
                    </div>
                </div>

                <div className='row features'>
                    <div className='col-6'>
                        <div className='row' id='create-delete-button'>
                            <div className='col-6'>
                                <button className='btn btn-primary' onClick={this.props.createFeature}>New
                                </button>
                            </div>
                            <div className='col-6'>
                                <button
                                    className={this.props.Feature.id === null ? "btn btn-danger float-right disabled" : "btn btn-danger float-right"}
                                    onClick={this.props.deleteFeature}>Delete
                                </button>
                            </div>
                        </div>
                        {selectedFeatures === STROKE_FEATURES
                            ? <StrokeFeatures features={this.props.Features} selectFeature={this.props.selectFeature}
                                              selected={this.props.Feature}/>
                            : (selectedFeatures === ANGIO_FEATURES
                                ? <AngioFeatures features={this.props.Features} selectFeature={this.props.selectFeature}
                                                 selected={this.props.Feature}/>
                                : <DegenerativeFeatures features={this.props.Features}
                                                        selectFeature={this.props.selectFeature}
                                                        selected={this.props.Feature}/>)}
                    </div>

                    <div className='col-6' id='save-button'>
                        <div className='row'>
                            <div className='col-6 offset-6'>
                                <button className='btn btn-success float-right' onClick={this.props.updateFeature}>Save
                                </button>
                            </div>
                        </div>
                        <div className='row'>
                            {selectedFeatures === STROKE_FEATURES
                                ? <StrokeFeatureEditor feature={this.props.Feature}
                                                       onFeatureChange={this.props.onFeatureChange}/>
                                : (selectedFeatures === ANGIO_FEATURES
                                    ? <AngioFeatureEditor feature={this.props.Feature}
                                                          onFeatureChange={this.props.onFeatureChange}/>
                                    : <DegenerativeFeatureEditor feature={this.props.Feature}
                                                                 onFeatureChange={this.props.onFeatureChange}/>)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

RightPane.propTypes = {
    selectStroke: PropTypes.func,
    selectAngio: PropTypes.func,
    selectDegenerative: PropTypes.func,
    Feature: PropTypes.shape({id: PropTypes.number}),
    Features: PropTypes.array,
    Values: ValuesPropTypes,
    SelectedFeatures: PropTypes.string,
    SelectedRadiology: RadiologyPropTypes,
    createFeature: PropTypes.func,
    selectFeature: PropTypes.func,
    deleteFeature: PropTypes.func,
    updateFeature: PropTypes.func,
    onFeatureChange: PropTypes.func
}
