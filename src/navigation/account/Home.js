import React, { Component } from 'react'
import { View } from 'react-native'
import { withNavigation } from 'react-navigation'
import {
  Container, Content,
  Right, Body,
  List, ListItem, Icon, Text, Button,
} from 'native-base'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import Server from './components/Server'
import { logout } from '../../redux/App/actions'
import { selectIsAuthenticated } from '../../redux/App/selectors'
import LoginRegister from './LoginRegister'

const LoginRegisterWithNav = withNavigation(LoginRegister)

class AccountHome extends Component {

  render() {

    if (!this.props.isAuthenticated) {
      return (
        <LoginRegisterWithNav />
      )
    }

    const { navigate } = this.props.navigation

    return (
      <Container>
        <Content padder>
          <Server />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
            <Icon name="person" />
            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
              {`${this.props.t('HELLO')} ${ this.props.user.username }`}
            </Text>
          </View>
          <List>
            <ListItem button iconRight onPress={ () => navigate('AccountDetails') }>
              <Body>
                <Text>{this.props.t('DETAILS')}</Text>
              </Body>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
            <ListItem button iconRight onPress={ () => navigate('AccountAddresses') }>
              <Body>
                <Text>{this.props.t('ADDRESSES')}</Text>
              </Body>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
            <ListItem button iconRight onPress={ () => navigate('AccountOrders') }>
              <Body>
                <Text>{this.props.t('ORDERS')}</Text>
              </Body>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          </List>
          <View style={{ marginTop: 40, marginBottom: 60 }}>
            <Button block danger onPress={ () => this.props.logout() } testID="logout">
              <Text>{this.props.t('SIGN_OUT')}</Text>
            </Button>
          </View>
        </Content>
      </Container>
    )
  }
}

function mapStateToProps(state) {

  return {
    user: state.app.user,
    message: state.app.lastAuthenticationError,
    isAuthenticated: selectIsAuthenticated(state),
  }
}

function mapDispatchToProps(dispatch) {

  return {
    logout: () => dispatch(logout()),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AccountHome))
