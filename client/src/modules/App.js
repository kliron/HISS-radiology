import "whatwg-fetch"
import React from "react"
import {
    FETCH_LIMIT,
    getRadiologyFor,
    getRadiologyTotalRowsFor,
    getValues,
    getFeaturesFor,
    getStrokeFeaturesFor,
    getAngioFeaturesFor,
    getDegenerativeFeaturesFor,
    createStrokeFeature,
    createAngioFeature,
    createDegenerativeFeature,
    updateStrokeFeature,
    updateAngioFeature,
    updateDegenerativeFeature,
    deleteStrokeFeature,
    deleteAngioFeature,
    deleteDegenerativeFeature
} from "./IO"
import LeftPane from "./LeftPane"
import RightPane from "./RightPane"

const alert = window.alert

const FETCH_PREV = "fetch_previous"
const FETCH_NEXT = "fetch_next"
const FETCH_FIRST = "fetch_first"

// Valid values for features. These never change
const Values = {
    Locations: [],
    Kind: [],
    Temporal: [],
    Side: [],
    Extent: [],
    Grade: [],
    Vessels: [],
    VesselFinding: [],
    CorticalAtrophyDescription: []
}

class StrokeFeature {
    constructor(radiology) {
        this.id = null
        this.pid = radiology.pid
        this.eid = radiology.eid
        this.report_uid = radiology.report_uid
        this.kind = "NA"
        this.temporal = "NA"
        this.location = "NA"
        this.side = "NA"
        this.extent = "NA"
    }

    static valuesFor(variable) {
        switch (variable) {
            case "kind": {
                return Values.Kind
            }
            case "temporal": {
                return Values.Temporal
            }
            case "location": {
                return Values.Locations
            }
            case "side": {
                return Values.Side
            }
            case "extent": {
                return Values.Extent
            }
            default:
                throw new Error(`'${variable}' is not a valid StrokeFeature variable`)
        }
    }
}

class AngioFeature {
    constructor(radiology) {
        this.id = null
        this.pid = radiology.pid
        this.eid = radiology.eid
        this.report_uid = radiology.report_uid
        this.vessel = "NA"
        this.side = "NA"
        this.finding = "NA"
    }

    static valuesFor(variable) {
        switch (variable) {
            case "vessel": {
                return Values.Vessels
            }
            case "side": {
                return Values.Side
            }
            case "finding": {
                return Values.VesselFinding
            }
            default:
                throw new Error(`'${variable}' is not a valid AngioFeature variable`)
        }
    }
}

class DegenerativeFeature {
    constructor(radiology) {
        this.id = null
        this.pid = radiology.pid
        this.eid = radiology.eid
        this.report_uid = radiology.report_uid
        this.cortical_atrophy = "NA"
        this.cortical_atrophy_description = "NA"
        this.central_atrophy = "NA"
        this.microangiopathy = "NA"
    }

    static valuesFor(variable) {
        switch (variable) {
            case "cortical_atrophy": {
                return Values.Grade
            }
            case "cortical_atrophy_description": {
                return Values.CorticalAtrophyDescription
            }
            case "central_atrophy": {
                return Values.Grade
            }
            case "microangiopathy": {
                return Values.Grade
            }
            default:
                throw new Error(`'${variable}' is not a valid DegenerativeFeature variable`)
        }
    }
}

const STROKE_FEATURES = "StrokeFeatures"
const ANGIO_FEATURES = "AngioFeatures"
const DEGENERATIVE_FEATURES = "DegenerativeFeatures"

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // If this is not undefined, show radiology records for this pid only in left pane
            SelectedPid: undefined,
            // All radiology records
            Radiology: [],
            // Total number of records in the db
            RadiologyTotalRows: 0,
            // Current record 'page' offset
            Offset: 0,
            SelectedRadiology: undefined,
            // Features of the selected radiology record
            Features: {
                StrokeFeatures: [],
                AngioFeatures: [],
                DegenerativeFeatures: []
            },
            SelectedFeatures: STROKE_FEATURES,
            // This will hold a feature to edit
            Feature: new StrokeFeature({}) // initalize with dummy value just so that renderers will not barf
        }
        // Bind any function that needs a reference to `this` UNLESS they are arrow functions
        // (which bind `this` lexically) here:
        //
        // this.previousClicked = this.previousClicked.bind(this)
    }

    componentWillMount = async () => {
        const v = await getValues()
        Values.Kind = v.Kind
        Values.Temporal = v.Temporal
        Values.Locations = v.Locations
        Values.Side = v.Side
        Values.Extent = v.Extent
        Values.Grade = v.Grade
        Values.Vessels = v.Vessels
        Values.VesselFinding = v.VesselFinding
        Values.CorticalAtrophyDescription = v.CorticalAtrophyDescription

        const totalRows = await getRadiologyTotalRowsFor(this.state.SelectedPid)
        const radiology = await getRadiologyFor(this.state.SelectedPid, 0)
        const selected = radiology[0]
        const features = await getFeaturesFor(selected.report_uid)
        const feature = new StrokeFeature(selected)
        this.setState({
            RadiologyTotalRows: totalRows,
            Radiology: radiology,
            Offset: this.state.Offset + radiology.length,
            SelectedRadiology: selected,
            Features: features,
            Feature: feature
        })
    }

    hasNext = () => {
        return this.state.Offset < this.state.RadiologyTotalRows
    }

    hasPrevious = () => {
        return this.state.Offset > FETCH_LIMIT
    }

    _fetchData = async (mode) => {
        const pid = this.state.SelectedPid
        let offset
        switch (mode) {
            case FETCH_PREV:
                offset = this.state.Offset - 2 * FETCH_LIMIT
                break
            case FETCH_NEXT:
                offset = this.state.Offset
                break
            default: // FETCH_FIRST
                offset = 0
        }
        const records = await getRadiologyFor(pid, offset)
        const totalRows = mode === FETCH_FIRST ? await getRadiologyTotalRowsFor(pid) : this.state.RadiologyTotalRows

        let radiology, features, feature = undefined

        if (records.length > 0) {
            radiology = records[0]
            features = await getFeaturesFor(radiology.report_uid)
            feature = new StrokeFeature(radiology)
        }
        this.setState({
            Radiology: records,
            RadiologyTotalRows: totalRows,
            Offset: offset + records.length,
            SelectedRadiology: radiology,
            Features: features,
            Feature: feature,
            SelectedFeatures: STROKE_FEATURES
        })
    }

    previousClicked = async () => {
        if (this.hasPrevious()) {
           await this._fetchData(FETCH_PREV)
        }
    }

    nextClicked = async () => {
        if (this.hasNext()) {
           await this._fetchData(FETCH_NEXT)
        }
    }

    doSelectPid = async () => {
        await this._fetchData(FETCH_FIRST)
    }

    selectRadiology = async (report_uid) => {
        const selected = this.state.Radiology.filter(r => r.report_uid === report_uid)[0]
        if (selected === undefined) {
            alert(`Something went horribly wrong, no radiology record with id ${report_uid} exists!`)
            return
        }
        const features = await getFeaturesFor(report_uid)
        const feature = new StrokeFeature(selected)

        this.setState({
            SelectedRadiology: selected,
            SelectedFeatures: STROKE_FEATURES,
            Features: features,
            Feature: feature
        })
    }

    selectStroke = () => {
        const feature = new StrokeFeature(this.state.SelectedRadiology)
        this.setState({
            SelectedFeatures: STROKE_FEATURES,
            Feature: feature
        })
    }

    selectAngio = () => {
        const feature = new AngioFeature(this.state.SelectedRadiology)
        this.setState({
            SelectedFeatures: ANGIO_FEATURES,
            Feature: feature
        })
    }

    selectDegenerative = () => {
        const feature = new DegenerativeFeature(this.state.SelectedRadiology)
        this.setState({
            SelectedFeatures: DEGENERATIVE_FEATURES,
            Feature: feature
        })
    }

    selectFeature = (f) => {
        this.setState({
            Feature: f
        })
    }

    onFeatureChange = (f, vm, e) => {
        vm[f] = e.currentTarget.value
        this.setState({
            Feature: vm
        })
    }

    setStrokeFeatures = async () => {
        const state = this.state
        state.Features.StrokeFeatures = await getStrokeFeaturesFor(state.SelectedRadiology.report_uid)
        this.setState(state)
    }

    setAngioFeatures = async () => {
        const state = this.state
        state.Features.AngioFeatures = await getAngioFeaturesFor(state.SelectedRadiology.report_uid)
        this.setState(state)
    }

    setDegenerativeFeatures = async () => {
        const state = this.state
        state.Features.DegenerativeFeatures = await getDegenerativeFeaturesFor(state.SelectedRadiology.report_uid)
        this.setState(state)
    }

    deleteFeature = async () => {
        if (!confirm('Are you sure?')) return

        const id = this.state.Feature.id
        if (id === null) return

        switch (this.state.SelectedFeatures) {
            case STROKE_FEATURES: {
                await deleteStrokeFeature(id)
                await this.setStrokeFeatures()
                const sf = new StrokeFeature(this.state.SelectedRadiology)
                this.setState({
                    Feature: sf
                })
                break
            }
            case ANGIO_FEATURES: {
                await deleteAngioFeature(id)
                await this.setAngioFeatures()
                const af = new AngioFeature(this.state.SelectedRadiology)
                this.setState({
                    Feature: af
                })
                break
            }
            case DEGENERATIVE_FEATURES: {
                await deleteDegenerativeFeature(id)
                await this.setDegenerativeFeatures()
                const df = new DegenerativeFeature(this.state.SelectedRadiology)
                this.setState({
                    Feature: df
                })
                break
            }
            default:
                alert(`oops! ${this.state.SelectedFeatures} is not a known feature`)
        }
    }

    updateFeature = async () => {
        const data = this.state.Feature
        const id = data.id
        let saveFn
        switch (this.state.SelectedFeatures) {
            case STROKE_FEATURES: {
                saveFn = id === null ? createStrokeFeature : updateStrokeFeature
                await saveFn(data)
                await this.setStrokeFeatures()
                break
            }
            case ANGIO_FEATURES: {
                saveFn = id === null ? createAngioFeature : updateAngioFeature
                await saveFn(data)
                await this.setAngioFeatures()
                break
            }
            case DEGENERATIVE_FEATURES: {
                saveFn = id === null ? createDegenerativeFeature : updateDegenerativeFeature
                await saveFn(data)
                await this.setDegenerativeFeatures()
                break
            }
            default:
                alert(`oops! ${this.state.SelectedFeatures} is not a known feature`)
        }
    }

    selectPidKeydown = (ev) => {
        if (ev.keyCode === 13) {
            ev.preventDefault()
            this.doSelectPid(ev)
        }
    }

    changeSelectedPid = (ev) => {
        this.setState({SelectedPid: parseInt(ev.target.value) || undefined});
    }

    createFeature = async () => {
        switch (this.state.SelectedFeatures) {
            case STROKE_FEATURES: {
                const sf = new StrokeFeature(this.state.SelectedRadiology)
                const id = (await createStrokeFeature(sf)).id
                console.log(id)
                await this.setStrokeFeatures()
                this.selectFeature(this.state.Features.StrokeFeatures.filter(f => f.id === id)[0])
                break
            }
            case ANGIO_FEATURES: {
                const af = new AngioFeature(this.state.SelectedRadiology)
                const id = (await createAngioFeature(af)).id
                await this.setAngioFeatures()
                this.selectFeature(this.state.Features.AngioFeatures.filter(f => f.id === id)[0])
                break
            }
            case DEGENERATIVE_FEATURES: {
                const df = new DegenerativeFeature(this.state.SelectedRadiology)
                const id = (await createDegenerativeFeature(df)).id
                await this.setDegenerativeFeatures()
                this.selectFeature(this.state.Features.DegenerativeFeatures.filter(f => f.id === id)[0])
                break
            }
            default:
                alert(`oops! ${this.state.SelectedFeatures} is not a known feature`)
        }
    }

    render() {
        const { Features, SelectedFeatures } = this.state
        let features = []
        if (Features) {
            features = SelectedFeatures === STROKE_FEATURES ? Features.StrokeFeatures
                : (SelectedFeatures === ANGIO_FEATURES ? Features.AngioFeatures : Features.DegenerativeFeatures)
        }

        return (
            <div className='container' id='root'>
                <div className='row'>
                    <LeftPane SelectedPid={this.state.SelectedPid}
                              selectPidKeydown={this.selectPidKeydown}
                              changeSelectedPid={this.changeSelectedPid}
                              doSelectPid={this.doSelectPid}
                              Radiology={this.state.Radiology}
                              RadiologyTotalRows={this.state.RadiologyTotalRows}
                              SelectedRadiology={this.state.SelectedRadiology}
                              selectRadiology={this.selectRadiology}
                              currentOffset={this.state.Offset}
                              hasPrevious={this.hasPrevious()}
                              previousClicked={this.previousClicked}
                              hasNext={this.hasNext()}
                              nextClicked={this.nextClicked}></LeftPane>

                    <RightPane SelectedRadiology={this.state.SelectedRadiology}
                               Features={features}
                               SelectedFeatures={this.state.SelectedFeatures}
                               selectStroke={this.selectStroke}
                               selectAngio={this.selectAngio}
                               selectDegenerative={this.selectDegenerative}
                               selectFeature={this.selectFeature}
                               createFeature={this.createFeature}
                               deleteFeature={this.deleteFeature}
                               updateFeature={this.updateFeature}
                               onFeatureChange={this.onFeatureChange}
                               Feature={this.state.Feature}></RightPane>
                </div>
            </div>
        )
    }
}

export {
    App,
    Values,
    STROKE_FEATURES,
    ANGIO_FEATURES,
    DEGENERATIVE_FEATURES
}
