import React, { Component } from 'react';
import { StyleSheet, Text, View,Image, FlatList } from 'react-native';
import {Card, CardItem, Thumbnail, Body, Left, Header, Right, Title, Segment, Button} from 'native-base';
import ConfettiCannon from 'react-native-confetti-cannon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from './Header';

export default class MyVoucherScreen extends Component {

  constructor() {
    super();
    this.ref =  firestore();
    this.unsubscribe = null;
    this.state = {
      //defalt false and if true cannon will be fired
      shoot: false,
      dataSource: [],
      vouchers:[]
    };
  }

  
  onCollectionUpdate = (querySnapshot) => {
    const vouchers = [];
    querySnapshot.forEach((doc) => {
        vouchers.push ({
            datas : doc.data(),
            key : doc.id
            });
    })
    this.setState({
      dataSource : vouchers,
   })

  }

  async component (){
    let userId= await AsyncStorage.getItem('uid');
    const self = this;

			/* This will also be triggered when new items are added to or removed from cart  */
			self.unsubscribeCartItems =  firestore().collection('user_vouchers').doc(userId).onSnapshot(snapshot => {
				let updatedCart = []; /* Set empty array cart by default */
				
				if(snapshot.data() && Object.keys(snapshot.data()).length){
					/* Loop through list of cart item IDs  */
					Object.values(snapshot.data()).forEach(function (snapshotCart, index) {
							updatedCart.push({...snapshotCart});
							self.setState({vouchers: updatedCart, loading: false}); /* !!!! setState is running multiple times here, figure out how to detect when child_added completed*/
					
					});
				} else {
					self.setState({vouchers: [], loading: false})
				}
			});
  }

  componentDidMount() {
    //Time out to fire the cannon
    this.unsubscribe = this.ref.collection('vouchers').onSnapshot(this.onCollectionUpdate) ;
    
   this.component();

  }
  

  

	
 async onClaimVoucher(data) {
    const { vouchers } = this.state;
 
        let is_existing = Object.keys(vouchers).length && Object.values(vouchers).find(item => data.id === item.id); /* Check if item already exists in cart from state */
        if(!is_existing){
            let newItem = {
                'id': data.id,
                'store_name': data.store_name,
                'store_id': data.store_id,
                'minimum': data.minimum,
                'type': data.type,
                'validity': data.validity,
                'store_image': data.store_image,
                'amount': data.amount
            };
            let userId= await AsyncStorage.getItem('uid');
            let updatedData = Object.values(vouchers); /* Clone it first */
            let voucherRef =  firestore().collection('user_vouchers');
            
            /* Push new cart item */
            updatedData.push(newItem); 
            
            /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
            voucherRef.doc(userId).set(Object.assign({}, updatedData)).then(() => {
                alert('test');
                this.setState({ shoot: true });
            });
        }else{
            alert('voucher already exist')
        }
}


  render() {
    return (
      <View style={styles.Container}>
            <CustomHeader title="My Vouchers"  Cartoff={true} navigation={this.props.navigation}/>
                <FlatList
                    data={this.state.vouchers}
                    renderItem={({ item }) => 
                    <Card transparent>
                    <CardItem style={{ borderWidth: 0.1, marginHorizontal: 10}}> 
                    <View style={{flexDirection: 'column', paddingRight: 10}}>          
                     <Thumbnail style={{padding: 0, margin: 0, height: 40, width: 40}}  source={{uri: item.store_image}} /> 
                        <Text style={{fontSize: 7, textAlign: 'center'}}>{item.store_name}</Text> 
                     </View> 
                      <Body style={{paddingLeft: 10, paddingTop: 10}}>
                          <Text style={{fontSize: 14, fontWeight:'bold'}}>₱{item.amount} off</Text>
                          <Text note style={{color:'salmon', fontSize: 12, }}>Min. Spend {item.minimum}</Text>
                      </Body>
                      <Right>
                        {item.status == 'used' &&
                        <View style={{padding: 6, backgroundColor: 'grey', borderRadius: 10, }}><Text style={{color: 'white'}}>Used</Text></View>}                    
                      </Right>
                    </CardItem>
                  </Card>  
                    }
                    keyExtractor={item => item.id}
                />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  cardLayoutView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff9c4',
  }, 
  paragraphHeading: {
    margin: 24,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  logo: {
    height: 130,
    width: 130,
    marginBottom: 20,
  },
});