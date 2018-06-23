import React from "react"
import PropTypes from "prop-types"
import {FETCH_LIMIT} from "./IO"

function RadiologyRow(props) {
    const row = props.row || {}
    const selected = props.selected || {}

    return (
        <div className='row radiology' onClick={props.selectRadiology.bind(null, row.report_uid)}>
            <div className={selected.report_uid === row.report_uid ? "col-md-12 selected" : "col-md-12"}>
                {`${row.report_uid} - ${row.request}`}
            </div>
        </div>
    )
}

RadiologyRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.object,
    selectRadiology: PropTypes.func
}

export default class LeftPane extends React.Component {
    render() {
        const renderRadiologyList = () => {
            const radiology = this.props.Radiology
            if (radiology.length < 1) {
                return null
            }
            return radiology.map(r =>
                <RadiologyRow key={r.report_uid}
                              row={r}
                              selected={this.props.SelectedRadiology}
                              selectRadiology={this.props.selectRadiology}/>)
        }
        const from = FETCH_LIMIT < this.props.currentOffset ? (this.props.currentOffset + 1 - FETCH_LIMIT) : 1
        const to = this.props.currentOffset
        return (
            <div className='col-xs-6 col-sm-6 col-md-5 col-lg-4 col-xl-3' id='left-pane'>

                <div className='row'>
                    <div className='col-xs-8' id='pid-input'>
                        <input type='number' placeholder='pid' value={this.props.SelectedPid || ''}  onKeyDown={this.props.selectPidKeydown} onChange={this.props.changeSelectedPid}/>
                    </div>
                    <div className='col-xs-4'>
                        <button className='btn btn-sm btn-primary float-sm-right' onClick={this.props.doSelectPid}>Find</button>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-xs-12' id='radiology-rows'>
                        <span><b>Records: {`${from}-${to}/${this.props.RadiologyTotalRows}`}</b></span>
                        <div className='row' id='prev-next-buttons'>
                            <div className='col-6'>
                                <button className={this.props.hasPrevious ? "btn btn-light" : "btn btn-light disabled"}
                                        onClick={this.props.previousClicked}>Previous
                                </button>
                            </div>
                            <div className='col-6'>
                                <button className={this.props.hasNext ? "btn btn-light" : "btn btn-light disabled"}
                                        onClick={this.props.nextClicked}>Next
                                </button>
                            </div>
                        </div>
                        <div>
                            {renderRadiologyList()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

LeftPane.propTypes = {
    SelectedPid: PropTypes.number,
    selectPidKeydown: PropTypes.func,
    changeSelectedPid: PropTypes.func,
    doSelectPid: PropTypes.func,
    currentOffset: PropTypes.number,
    RadiologyTotalRows: PropTypes.number,
    hasPrevious: PropTypes.bool,
    hasNext: PropTypes.bool,
    previousClicked: PropTypes.func,
    nextClicked: PropTypes.func,
    Radiology: PropTypes.array,
    SelectedRadiology: PropTypes.object,
    selectRadiology: PropTypes.func
}
