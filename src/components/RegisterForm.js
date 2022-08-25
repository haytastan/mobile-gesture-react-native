import React from 'react'
import { View } from 'react-native'
import { Form, Item, Input, Label, Button, Text } from 'native-base'
import { withTranslation } from 'react-i18next'
import validate from 'validate.js'
import _ from 'lodash'
import { Formik } from 'formik'

import i18n from '../i18n'

// Custom validator for matches
// Checks whether the given value matches another value in the object under validation
// Used for password confirmation checks
validate.validators.matches = (value, options, key, attributes) =>
  value === attributes[options.key]
    ? null
    : options.message

const inputs = [
  {
    name: 'email',
    label: i18n.t('EMAIL'),
    props: {
      keyboardType: 'email-address',
    },
    constraints: {
      presence: { message: i18n.t('INVALID_EMAIL') },
      email: {
        message: i18n.t('INVALID_EMAIL'),
      },
    },
  },
  {
    name: 'username',
    label: i18n.t('USERNAME'),
    constraints: {
      presence: { message: i18n.t('INVALID_USERNAME') },
      // https://github.com/coopcycle/coopcycle-web/blob/82220bc36dd3c44e6e770abee022c6f736f4228c/src/AppBundle/Entity/ApiUser.php#L40-L45
      length: {
        minimum: 3,
        maximum: 15,
        message: i18n.t('INVALID_USERNAME'),
      },
      format: {
        pattern: /^[a-zA-Z0-9_]{3,15}$/,
        message: i18n.t('INVALID_USERNAME_FORMAT'),
      },
    },
  },
  {
    name: 'password',
    label: i18n.t('PASSWORD'),
    props: {
      secureTextEntry: true,
    },
    constraints: {
      presence: { message: i18n.t('INVALID_PASSWORD') },
      // https://github.com/FriendsOfSymfony/FOSUserBundle/blob/ee76c57c6a0966c24f4f9a693790ecd61bf2ddce/Resources/config/validation.xml#L65-L75
      length: {
        minimum: 8,
        maximum: 4096,
        message: i18n.t('INVALID_PASSWORD'),
      },
    },
  },
  {
    name: 'passwordConfirmation',
    label: i18n.t('CONFIRM_PASSWORD'),
    props: {
      secureTextEntry: true,
    },
    constraints: {
      presence: { message: i18n.t('INVALID_PASSWORD_CONFIRMATION') },
      matches: {
        key: 'password',
        message: i18n.t('INVALID_PASSWORD_CONFIRMATION'),
      },
    },
  },
  {
    name: 'givenName',
    label: i18n.t('GIVEN_NAME'),
    constraints: {
      presence: { message: i18n.t('INVALID_GIVEN_NAME') },
      length: {
        minimum: 1,
        message: i18n.t('INVALID_GIVEN_NAME'),
      },
    },
  },
  {
    name: 'familyName',
    label: i18n.t('FAMILY_NAME'),
    constraints: {
      presence: { message: i18n.t('INVALID_FAMILY_NAME') },
      length: {
        minimum: 1,
        message: i18n.t('INVALID_FAMILY_NAME'),
      },
    },
  }
]

let constraints = _.reduce(
  inputs,
  (acc, { name, constraints }) => ({ ...acc, [name]: constraints }),
  {}
)

class RegisterForm extends React.Component {

  constructor(props) {
    super(props)

    this._inputComponents = new Map()
  }

  renderError(message) {

    return (
      <View>
        <Text note style={{ marginLeft: 15, color: '#ed2f2f' }}>{ message }</Text>
      </View>
    )
  }

  _validate(values) {

    return _.mapValues(
      validate(values, constraints, { fullMessages: false }),
      messages => _.first(messages)
    )
  }

  _onSubmit(values) {
    this.props.onSubmit(values)
  }

  render() {

    const initialValues = {
      email: this.props.prefill === true ? 'john.doe@coopcycle.org' : '',
      username: this.props.prefill === true ? 'johndoe' : '',
      password: this.props.prefill === true ? '12345678' : '',
      passwordConfirmation: this.props.prefill === true ? '12345678' : '',
      givenName: this.props.prefill === true ? 'John' : '',
      familyName: this.props.prefill === true ? 'Doe' : '',
    }

    return (
      <Formik
        initialValues={ initialValues }
        validate={ this._validate.bind(this) }
        onSubmit={ this._onSubmit.bind(this) }
        validateOnBlur={ false }
        validateOnChange={ false }>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {

          const allErrors = {
            ...errors,
            ...this.props.errors,
          }

          return (
            <View>
              <Form>
                { inputs.map((input, index) => {

                  const hasError = allErrors.hasOwnProperty(input.name)
                  const itemProps = hasError ? { error: true } : {}

                  let inputProps = {
                    ...input.props,
                    onChangeText: handleChange(input.name),
                    onBlur: handleBlur(input.name),
                  }

                  const isLast = index === (inputs.length - 1)

                  if (isLast) {
                    inputProps = {
                      ...inputProps,
                      returnKeyType: 'done',
                      onSubmitEditing: handleSubmit,
                    }
                  } else {
                    inputProps = {
                      ...inputProps,
                      returnKeyType: 'next',
                      onSubmitEditing: event => {
                        let index = inputs.findIndex((el) => el.name === input.name)
                        let nextInputName = inputs[index + 1].name
                        this._inputComponents.get(nextInputName)._root.focus()
                      },
                    }
                  }

                  return (
                    <View key={ input.name }>
                      <Item stackedLabel { ...itemProps }>
                        <Label>{ input.label }</Label>
                        <Input
                          testID={ `registerForm.${input.name}` }
                          ref={ component => this._inputComponents.set(input.name, component) }
                          defaultValue={ values[input.name] }
                          autoCorrect={ false }
                          autoCapitalize="none"
                          style={{ height: 40 }}
                          { ...inputProps } />
                      </Item>
                      { hasError && this.renderError(allErrors[input.name]) }
                    </View>
                  )
                }) }
              </Form>
              <View style={{ marginTop: 20 }}>
                <Button block onPress={ handleSubmit } testID="submitRegister">
                  <Text>{this.props.t('SUBMIT')}</Text>
                </Button>
              </View>
            </View>
          )
        }}
      </Formik>
    )
  }
}

export default withTranslation()(RegisterForm)
