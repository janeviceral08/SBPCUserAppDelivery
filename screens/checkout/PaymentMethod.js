
import React, { Component } from 'react';
import { Content, Right, Card, CardItem, Body,Item, Input,Text, Form , Picker, View } from 'native-base';

// Our custom files and classes import
import { RadioButton } from 'react-native-paper';

export default class PaymentMethod extends Component {
  constructor(props) {
      super(props);

      this.state = {
       barangay: '',
       checked: 'Cash On Delivery',
      };
  }


  onValueChange(value) {
    this.setState({
      barangay: value
    });
  }
  render() {
    const { checked } = this.state;
    return(            
            <Content >
                <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                    <CardItem header>
                        <Text style={{fontSize: 18,fontWeight:'bold'}}>Payment Method</Text>
                    </CardItem>
                    <View style={{flexDirection: 'row'}}>
                        <RadioButton
                        value="Cash On Delivery"
                        status={checked === 'Cash On Delivery' ? 'checked' : 'unchecked'}
                        onPress={() => { this.setState({ checked: 'Cash On Delivery' }); }}
                        />
                        
                        <Text style={{padding: 5}}>Cash On Delivery (COD)</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <RadioButton
                        value="first"
                        status={checked === 'Paypal'? 'checked' : 'unchecked'}
                        onPress={() => { this.setState({ checked: 'Paypal' }); }}
                        />
                        <Text style={{padding: 5}}>Paypal</Text>
                    </View>
                   
                </Card> 
            </Content>   
    );
  }

}
