import React from 'react'
import PropTypes from 'prop-types'

import * as validators from '../../../utils/validators.js'

import {
  DATA_TYPES,
  DATA_TYPE_OPTIONS,
  MAX_SQL_IDENTIFIER_LENGTH
} from '../../../constants.js'

import Button from '../../components/Button.jsx'
import Checkbox from '../../components/Checkbox.jsx'

const DEFAULT_DATA_TYPE = DATA_TYPES.STRING

export default class NewFieldForm extends React.Component {
  constructor (props) {
    super(props)

    this.nameInput = React.createRef()

    this.state = {
      field: emptyField(),
      errors: []
    }
  }

  componentDidMount () {
    this.focusOnName()
  }

  focusOnName () {
    this.nameInput.current.focus()
  }

  create = () => {
    const field = formatField(this.state.field)
    const errors = validateField(field, this.props.fields)

    if (errors.length > 0) {
      this.setState({ errors })
    } else {
      this.props.onCreate({ field })
      this.setState({ field: emptyField() })
      this.focusOnName()
    }
  }

  cancel = () => {
    this.props.onCancel()
    this.setState({ field: emptyField() })
  }

  inputName = name => this.mapField(field => ({ ...field, name }))
  selectField = type => this.mapField(field => ({ ...field, type }))

  togglePrimaryKey = primaryKey =>
    this.mapField(field => ({ ...field, primaryKey }))

  toggleRequired = required => this.mapField(field => ({ ...field, required }))

  toggleUnique = unique => this.mapField(field => ({ ...field, unique }))

  mapField = fn => {
    const field = fn(this.state.field)

    const errors =
      this.state.errors.length > 0
        ? validateField(formatField(field), this.props.fields)
        : this.state.errors

    this.setState({ field, errors })
  }

  render () {
    return (
      <form
        id='new-field-form'
        className='new-field-form field-form'
        onSubmit={event => {
          event.preventDefault()
          this.create()
        }}
        onKeyDown={evt => {
          if (evt.keyCode === 27) {
            evt.preventDefault()
            this.cancel()
          }
        }}
      >
        <div className='field-form__item field-form__name'>
          <label htmlFor='new-field-name'>Name</label>
          <input
            ref={this.nameInput}
            id='new-field-name'
            type='text'
            value={this.state.field.name}
            onChange={event => this.inputName(event.target.value)}
          />
        </div>
        <div className='field-form__item field-form__type'>
          <label htmlFor='new-field-type'>Type</label>
          <select
            id='new-field-type'
            default={this.state.field.type || DEFAULT_DATA_TYPE}
            value={this.state.field.type || DEFAULT_DATA_TYPE}
            onChange={event => this.selectField(event.target.value)}
          >
            {Object.entries(DATA_TYPE_OPTIONS).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div className='field-form__item field-form__options'>
          <Checkbox
            id='new-field-primary-key'
            className='field-form__option'
            label='Primary Key'
            checked={this.state.field.primaryKey}
            onCheck={this.togglePrimaryKey}
          />
          <Checkbox
            id='new-field-unique'
            className='field-form__option'
            label='Unique'
            checked={this.state.field.unique}
            onCheck={this.toggleUnique}
          />
          <Checkbox
            id='new-field-required'
            className='field-form__option'
            label='Required'
            checked={this.state.field.required}
            onCheck={this.toggleRequired}
          />
        </div>
        <div className='field-form__item field-form__actions'>
          <Button
            primary
            type='submit'
            icon='check'
            className='field-form__action'
            label='Add'
            disabled={this.state.errors.length > 0}
          />
          <Button
            primary
            type='button'
            icon='cancel'
            className='field-form__action'
            label='Cancel'
            onClick={this.cancel}
          />
        </div>

        {this.state.errors.length ? (
          <ul>
            {this.state.errors.map(error => (
              <li key={error}>{displayErrors(error)}</li>
            ))}
          </ul>
        ) : null}
      </form>
    )
  }
}

NewFieldForm.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCancel: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
}

const formatField = field => ({ ...field, name: field.name.trim() })

const UNIQUE_NAME_ERROR = 'UNIQUE_NAME_ERROR'
const NAME_FORMAT_ERROR = 'NAME_FORMAT_ERROR'
const REQUIRED_NAME_ERROR = 'REQUIRED_NAME_ERROR'
const NAME_LENGTH_ERROR = 'NAME_LENGTH_ERROR'
const REQUIRED_TYPE_ERROR = 'REQUIRED_TYPE_ERROR'

const validateField = (field, fields) => {
  const validations = [
    [UNIQUE_NAME_ERROR, validators.validateUniqueName(field, fields)],
    [NAME_FORMAT_ERROR, validators.validateIdentifierFormat(field.name)],
    [REQUIRED_NAME_ERROR, validators.validateRequired(field.name)],
    [NAME_LENGTH_ERROR, validators.validateIdentifierLength(field.name)],
    [REQUIRED_TYPE_ERROR, validators.validateRequired(field.type)]
  ]

  return validations.filter(([_, valid]) => !valid).map(([error, _]) => error)
}

const displayErrors = error => {
  switch (error) {
    case UNIQUE_NAME_ERROR:
      return 'Name already taken.'
    case NAME_FORMAT_ERROR:
      return 'Name can only contain letters, numbers, spaces, _ or $ and cannot start with a number.'
    case REQUIRED_NAME_ERROR:
      return 'Name is required.'
    case NAME_LENGTH_ERROR:
      return `Name cannot be more than ${MAX_SQL_IDENTIFIER_LENGTH} characters when converted to snake_case.`
    case REQUIRED_TYPE_ERROR:
      return 'Type is required.'
    default:
      return 'Sorry, something went wront.'
  }
}

const emptyField = () => ({
  name: '',
  type: DEFAULT_DATA_TYPE,
  primaryKey: false,
  required: false,
  unique: false
})
