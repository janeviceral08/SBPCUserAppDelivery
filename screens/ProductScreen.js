import React, { Component } from "react";
import { Platform, StyleSheet,  View } from "react-native";
import DynamicTabView from "react-native-dynamic-tab-view";
import Products from "../components/ProductCard";
import { Container, Header, Item, Input, Icon, Button, Text, Left, Right,Body,Title,Form, Picker } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from './Header';

export default class ProductScreen extends Component{
  constructor(props) {
    super(props);
    const store = this.props.route.params.store;
    this.state = {
      defaultIndex: 0,
      category : store.subcategory,
      name: store.name,
      store_id: store.id,
      token: store.notification_token,
      visibleModal: false,
      count: 0,
      dataProvider: []
    };
  }

  _renderItem = (item, index) => {
    return (
      <View
        key={item["key"]}
        style={{ backgroundColor: '#ffffff', flex: 1}}
      >
        <Products title={item["title"]} store={this.state.name} storeId={this.state.store_id} token={this.state.token}  navigation={this.props.navigation}/>
      </View>
    );
  };

  componentWillUnmount() {
 
		this.unsubscribeProduct && this.unsubscribeProduct();
  }

  onChangeTab = index => {};
  
render() {
   
    return (
    <Container style={{flex: 1}}>
    <CustomHeader title={this.state.name}  navigation={this.props.navigation}/>
      <DynamicTabView
        data={this.state.category}
        renderTab={this._renderItem}
        defaultIndex={this.state.defaultIndex}
        containerStyle={styles.container}
        headerBackgroundColor={'white'}
        headerTextStyle={styles.headerText}
        onChangeTab={this.onChangeTab}
        headerUnderlayColor={'tomato'}
      /> 
    </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
    paddingTop: 0,
    marginTop:0,
    marginBottom:0,
    height: 50
  },

  headerContainer: {
    marginTop: 5,
   
  },
  headerText: {
    color:'black'
  },
  tabItemContainer: {
    backgroundColor: "#cf6bab"
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});