import _ from "lodash";
import moment from "moment-timezone";
import React, { PropTypes } from "react";
import { Input, Glyphicon, Accordion, Panel } from "react-bootstrap";
import TaxonAutocomplete from "./taxon_autocomplete";
import DateTimeFieldWrapper from "./date_time_field_wrapper";
import SelectionBasedComponent from "./selection_based_component";
import ObservationFieldsChooser from "./observation_fields_chooser";
import ProjectsChooser from "./projects_chooser";
import TagsChooser from "./tags_chooser";

class LeftMenu extends SelectionBasedComponent {

  constructor( props, context ) {
    super( props, context );
    this.openLocationChooser = this.openLocationChooser.bind( this );
  }

  shouldComponentUpdate( nextProps ) {
    if ( this.props.reactKey === nextProps.reactKey ) { return false; }
    return true;
  }

  openLocationChooser( ) {
    this.props.setState( { locationChooser: {
      show: true,
      zoom: this.commonValue( "zoom" ),
      radius: this.commonValue( "accuracy" ),
      lat: this.commonValue( "latitude" ),
      lng: this.commonValue( "longitude" ),
      notes: this.commonValue( "locality_notes" ),
      geoprivacy: this.commonValue( "geoprivacy" ),
      obsCards: this.props.selectedObsCards
    } } );
  }

  render( ) {
    const { updateSelectedObsCards, selectedObsCards } = this.props;
    const keys = _.keys( selectedObsCards );
    const count = keys.length;
    const uniqDescriptions = this.valuesOf( "description" );
    const commonDescription = this.commonValue( "description" );
    const commonSelectedTaxon = this.commonValue( "selected_taxon" );
    const commonDate = this.commonValue( "date" );
    const commonLat = this.commonValue( "latitude" );
    const commonLng = this.commonValue( "longitude" );
    const commonNotes = this.commonValue( "locality_notes" );
    const commonGeoprivacy = this.commonValue( "geoprivacy" );
    let locationText = commonNotes ||
      ( commonLat && commonLng &&
      `${_.round( commonLat, 4 )},${_.round( commonLng, 4 )}` );
    let multipleGeoprivacy = !commonGeoprivacy && ( <option>{ " -- multiple -- " }</option> );
    let menu;
    if ( count === 0 ) {
      menu = ( <span className="head">{ I18n.t( "select_observations_to_edit" )} </span> );
    } else {
      menu = (
        <div>
          <span className="head" dangerouslySetInnerHTML={
            { __html: I18n.t( "editing_observations", { count } ) } }
          />
          <br />
          <br />
          <Accordion defaultActiveKey="1">
            <Panel
              eventKey="1"
              className="details-panel"
              header={ ( <div>Details<Glyphicon glyph="menu-right" className="rotate" /></div> ) }
              onEnter={ () => { $( ".details-panel .glyphicon" ).addClass( "rotate" ); } }
              onExit={ () => { $( ".details-panel .glyphicon" ).removeClass( "rotate" ); } }
            >
              <TaxonAutocomplete
                key={
                  `multitaxonac${commonSelectedTaxon && commonSelectedTaxon.title}` }
                bootstrap
                searchExternal
                showPlaceholder
                perPage={ 6 }
                initialSelection={ commonSelectedTaxon }
                afterSelect={ r => {
                  if ( !commonSelectedTaxon || r.item.id !== commonSelectedTaxon.id ) {
                    updateSelectedObsCards(
                      { taxon_id: r.item.id,
                        selected_taxon: r.item,
                        species_guess: r.item.title } );
                  }
                } }
                afterUnselect={ ( ) => {
                  if ( commonSelectedTaxon ) {
                    updateSelectedObsCards(
                      { taxon_id: null,
                        selected_taxon: null,
                        species_guess: null } );
                  }
                } }
                placeholder={ this.valuesOf( "selected_taxon" ).length > 1 ?
                  I18n.t( "edit_multiple_species" ) : I18n.t( "species_name_cap" ) }
              />
              <DateTimeFieldWrapper
                ref="datetime"
                key={ `multidate${commonDate}` }
                reactKey={ `multidate${commonDate}` }
                dateTime={ commonDate ?
                    moment( commonDate, "YYYY/MM/DD h:mm A z" ).format( "x" ) : undefined }
                onChange={ dateString => updateSelectedObsCards(
                  { date: dateString, selected_date: dateString } ) }
              />
              <div className="input-group"
                onClick= { ( ) => {
                  if ( this.refs.datetime ) {
                    this.refs.datetime.onClick( );
                  }
                } }
              >
                <div className="input-group-addon">
                  <Glyphicon glyph="calendar" />
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={ commonDate }
                  onChange= { e => {
                    if ( this.refs.datetime ) {
                      this.refs.datetime.onChange( undefined, e.target.value );
                    }
                  } }
                  placeholder={ this.valuesOf( "date" ).length > 1 ?
                    I18n.t( "edit_multiple_dates" ) : I18n.t( "date_" ) }
                />
              </div>
              <div className="input-group"
                onClick={ this.openLocationChooser }
              >
                <div className="input-group-addon">
                  <Glyphicon glyph="map-marker" />
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={ locationText }
                  placeholder={ ( this.valuesOf( "latitude" ).length > 1 &&
                    this.valuesOf( "longitude" ).length > 1 ) ?
                    I18n.t( "edit_multiple_locations" ) : I18n.t( "location" ) }
                  readOnly
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder={ uniqDescriptions.length > 1 ?
                    I18n.t( "edit_multiple_descriptions" ) : I18n.t( "description" ) }
                  className="form-control"
                  value={ commonDescription || "" }
                  onChange={ e => updateSelectedObsCards( { description: e.target.value } ) }
                />
              </div>
              <Input
                key={ `multigeoprivacy${commonGeoprivacy}` }
                type="select"
                value={ commonGeoprivacy }
                onChange={ e => updateSelectedObsCards( { geoprivacy: e.target.value } ) }
              >
                { multipleGeoprivacy }
                <option value="open">{ "Location is public" }</option>
                <option value="obscured">{ "Location is obscured" }</option>
                <option value="private">{ "Location is private" }</option>
              </Input>
              <Input type="checkbox"
                label={ I18n.t( "captive_cultivated" ) }
                checked={ this.commonValue( "captive" ) }
                value="true"
                onChange={ e =>
                  updateSelectedObsCards( { captive: $( e.target ).is( ":checked" ) } ) }
              />
            </Panel>
            <Panel
              eventKey="2"
              className="tags-panel"
              header={ ( <div>Tags<Glyphicon glyph="menu-right" /></div> ) }
              onEnter={ () => { $( ".tags-panel .glyphicon" ).addClass( "rotate" ); } }
              onExit={ () => { $( ".tags-panel .glyphicon" ).removeClass( "rotate" ); } }
            >
              <TagsChooser { ...this.props } />
            </Panel>
            <Panel
              eventKey="3"
              className="projects-panel"
              header={ ( <div>Projects<Glyphicon glyph="menu-right" /></div> ) }
              onEnter={ () => { $( ".projects-panel .glyphicon" ).addClass( "rotate" ); } }
              onExit={ () => { $( ".projects-panel .glyphicon" ).removeClass( "rotate" ); } }
            >
              <ProjectsChooser { ...this.props } />
            </Panel>
            <Panel
              eventKey="4"
              className="fields-panel"
              header={ ( <div>Fields<Glyphicon glyph="menu-right" /></div> ) }
              onEnter={ () => { $( ".fields-panel .glyphicon" ).addClass( "rotate" ); } }
              onExit={ () => { $( ".fields-panel .glyphicon" ).removeClass( "rotate" ); } }
            >
              <ObservationFieldsChooser { ...this.props } />
            </Panel>
          </Accordion>
        </div>
      );
    }
    return (
      <div className="left-col-padding">
        {menu}
      </div>
    );
  }
}

LeftMenu.propTypes = {
  obsCards: PropTypes.object,
  selectedObsCards: PropTypes.object,
  updateSelectedObsCards: PropTypes.func,
  appendToSelectedObsCards: PropTypes.func,
  removeFromSelectedObsCards: PropTypes.func,
  setState: PropTypes.func,
  reactKey: PropTypes.string
};

export default LeftMenu;
