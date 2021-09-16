import React, { Component } from 'react';
import {FlatList, TouchableOpacity, Dimensions, View, Alert, StatusBar, StyleSheet, ScrollView, TouchableHighlight, Image} from 'react-native';
import { Col, Card, CardItem, Body, Button, Left, ListItem, List, Content, Thumbnail, Right, Text,Grid, Icon,  Container, Header,Item, Input, Toast, Root } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import FastImage from 'react-native-fast-image';
const SCREEN_WIDTH = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../screens/Header';
import Fontisto from 'react-native-vector-icons/Fontisto'
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign'
import styles from './styles'
import Modal from 'react-native-modal';
import { RadioButton, Divider } from 'react-native-paper';

export default class Searchbar extends Component {
    constructor(props) {
        super(props);
        const storeId = this.props.navigation.getParam('storeId', 'NO-ID');
        const store_name = this.props.navigation.getParam('store_name', 'NO-ID');

        const notification_token = this.props.navigation.getParam('notification_token', 'NO-ID');
        this.ref =  firestore().collection('products').where('storeId', '==', storeId);
        this.state = {
          loading: false,      
          data: [],      
          error: null,    
          items:[],
          searchText:'',
          store_name: store_name,
          token: notification_token,
          cart: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss:[],
          choice:[],
          productss: [],
          isVisibleAddons: false,
          name: '',
          price: 0,
          image: [],
          id: '',
          sale_price: 0,
          unit: '',
          brand: '',
          count: 1
        };
    
        this.arrayholder = [];
    }

    _incrementCount = () => {
      this.setState(prevState => ({ count: prevState.count + 1 }));
    }

  _decrementCount = () => {
      this.setState(prevState => ({ count: prevState.count - 1 }));
    }

  checkDrink(drink, object) {
      const {choice} = this.state;
      var i;
      for (i = 0; i < object.length; i++) {
        if (object[i].isChecked === 'checked') {
          
          object[i].isChecked = 'unchecked';
        }
      }
      drink.isChecked = "checked";

          let updatedCart = choice;
          let item =  updatedCart.find(item => drink.id === item.id);
          if(item){
              let itemIndex = updatedCart.findIndex(item => drink.id === item.id);
              updatedCart.splice(itemIndex, 1);
              choice.push(drink) 
          }else{
              choice.push(drink)
          }
      console.log(choice)
      this.setState({ refresh: true });
    }
  
    getAddonsTotal=()=>{
      const {choice, productss} = this.state;
      let  total = 0;
      productss.map((object, d) =>
      object.data.map((drink, i) =>{ 
          if(drink.isChecked === "checked"){
              total += drink.price
          }
      })
  )
  console.log(total)
  return total;
  }

  getAddonsDefault=()=>{
      const {choice,productss} = this.state;
      let item =[]
      productss.map((object, d) =>
          object.data.map((drink, i) =>{ 
              if(drink.isChecked === "checked"){
                  choice.push(drink)
              }
          })
      )
      return choice;
  }

  async addonsdeleteCart(item){
    const userId= await AsyncStorage.getItem('uid');
    AsyncStorage.setItem('cluster', item.cluster);
     firestore().collection('cart').doc(userId).delete()  
    .catch(function(error) {
        console.log("Error deleting documents: ", error);
    });
    let name = item.name.concat(' Added to Cart');
    let newItem = {
              id: item.id,
              store_name: this.state.store_name,
              notification_token: this.state.token,
              total_addons: this.getAddonsTotal(),
              note: '',
              cluster: item.cluster,
              choice: this.getAddonsDefault(),
              qty: this.state.count,
            };
            let cartRef =  firestore().collection('cart');
            let updatedCart =[];
            /* Push new cart item */
            updatedCart.push(newItem); 
            cartRef.doc(userId).set(Object.assign({}, updatedCart))

            this.setState({
              isVisibleAddons: false,
              productss:[],
              count:1,
              choice:[]
          })
  }

    async addonsAddtoCart(item){
      const {cart} = this.state;
      const userId= await AsyncStorage.getItem('uid');
      if(userId){
        let id = item.id;
       let cluster = item.cluster
      let cluster_is_existing =Object.keys(cart).length && Object.values(cart).find(item => cluster === item.cluster);
      if ( cluster_is_existing == 0 || cluster_is_existing){
      let newItem = {
            id: item.id,
            store_name: this.state.store_name,
            notification_token: this.state.token,
            total_addons: this.getAddonsTotal(),
            note: '',
            qty: 1,
            cluster: item.cluster,
            choice: this.getAddonsDefault(),
            qty: this.state.count,
        };
        let updatedCart = Object.values(cart); /* Clone it first */
        let cartRef =  firestore().collection('cart');
        
        /* Push new cart item */
        updatedCart.push(newItem); 
        
        /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
        cartRef.doc(userId).set(Object.assign({}, updatedCart)).then(() => {
        
        });
  
        this.setState({
          isVisibleAddons: false,
          productss:[],
          count:1,
          choice:[]
      })
    }else{
      Alert.alert(
        'Discard Changes?',
        'This product belongs to another cluster, continuing will lose all your products in cart.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          { text: 'OK', onPress: () => this.addonsdeleteCart(item)}
        ],
        { cancelable: false }
      );
    }
    }
      else {
        this.setState({
          isVisibleAddons: false,
          productss:[],
          count:1,
          choice:[]
      })
        this.props.navigation.navigate('Auth');
      }
    }

    renderImage = ({ item }) => (
      <TouchableHighlight>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: item }} />
        </View>
      </TouchableHighlight>
    );

  async deleteCart(item) {
    const userId= await AsyncStorage.getItem('uid');
    AsyncStorage.setItem('cluster', item.cluster);
     firestore().collection('cart').doc(userId).delete()  
    .catch(function(error) {
        console.log("Error deleting documents: ", error);
    });
    let name = item.name.concat(' Added to Cart');
    let newItem = {
                id: item.id,
                store_name: this.state.store_name,
                notification_token: this.state.token,
                note: '',
                qty: 1,
                cluster: item.cluster
            };
            let cartRef =  firestore().collection('cart');
            let updatedCart =[];
            /* Push new cart item */
            updatedCart.push(newItem); 
            cartRef.doc(userId).set(Object.assign({}, updatedCart))
    
 
}
 
 	async onAddToCart(item) {
     const {cart} = this.state;
		const userId= await AsyncStorage.getItem('uid');
    const cluster = await AsyncStorage.getItem('cluster');
		if(userId){ 
      let id = item.id;
       let cluster = item.cluster
      let cluster_is_existing =Object.keys(cart).length && Object.values(cart).find(item => cluster === item.cluster);
      if ( cluster_is_existing == 0 || cluster_is_existing){
          
          let is_existing = Object.keys(cart).length && Object.values(cart).find(item => id === item.id); /* Check if item already exists in cart from state */
          if(!is_existing){
           
            let newItem = {
                id: item.id,
                store_name: this.state.store_name,
                notification_token: this.state.token,
                note: '',
                qty: 1,
                cluster: item.cluster
            };
            let updatedCart = Object.values(cart); /* Clone it first */
            let cartRef =  firestore().collection('cart');
            
            /* Push new cart item */
            updatedCart.push(newItem); 
            
            /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
            cartRef.doc(userId).set(Object.assign({}, updatedCart))
          }
      else{
        let product = Object.keys(cart).length && Object.values(cart).find(item => id === item.id); /* Check if item exists in cart from state */
		
            if(product){
              if(product.qty >= item.quantity){
                /* Do not allow save if user is trying to checkout more than what is available on stock */
                
              }
               else if (product.qty <= item.quantity){
                let cartRef =  firestore().collection('cart');
                
                /* Get current cart contents */
                cartRef.doc(userId).get().then(snapshot => {
                  let updatedCart = Object.values(snapshot.data()); /* Clone it first */
                  let itemIndex = updatedCart.findIndex(item => id === item.id); /* Get the index of the item we want to delete */
                  
                  /* Set item quantity */
                  updatedCart[itemIndex]['qty'] = updatedCart[itemIndex]['qty'] + 1; 
                  
                  /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
                  cartRef.doc(userId).set(Object.assign({}, updatedCart))
                });
              }
            }
      }
		} else {
			Alert.alert(
        'Discard Changes?',
        'This product belongs to another cluster, continuing will lose all your products in cart.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          { text: 'OK', onPress: () => this.deleteCart(item)}
        ],
        { cancelable: false }
      );
		}
	}
  else {
			this.props.navigation.navigate('Auth');
		}
}

    onCollectionUpdate = (querySnapshot) => {
      const products = [];
      querySnapshot.forEach((doc) => {
       products.push ({
              datas : doc.data(),
              key : doc.id
              });
      });
 
      this.arrayholder = products;
    }
  
   async componentDidMount() {
     const userId= await AsyncStorage.getItem('uid');
      this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);

       if(userId){
				/* Listen to realtime cart changes */
				this.unsubscribeCartItems =  firestore().collection('cart').doc(userId).onSnapshot(snapshotCart => {
					if(snapshotCart.data()){
						this.setState({cart: snapshotCart.data()});
					} else {
						this.setState({cart: []});
					}
				});
			}
    }
  
    componentWillUnMount(){
      this.unsubscribe() && this.unsubscribe
    }
    searchFilterFunction = text => {    
      const newData = this.arrayholder.filter(item => {      
        const itemData = `${item.datas.name.toUpperCase()}   
         ${item.datas.brand.toUpperCase()}`;
        
         const textData = text.toUpperCase();
          
         return itemData.indexOf(textData) > -1;
      });
      if(text == ""){
        this.setState({ data: [] }); 
      }else{
        this.setState({ data: newData }); 
      }
      
     
    };

    FoodAddons(item){
      let img=[];
      let add=[];
      this.setState({ isVisibleAddons: true,
                      name: item.name,
                      price: item.price,
                      image: img.concat(item.featured_image),
                      id: item.id,
                      sale_price: item.sale_price,
                      unit: item.unit,
                      brand: item.brand,
                      productss: item.addons,
                      addonss: item
      })

  }

  router(item){
    if(!item.status || item.quantity<= 0  || !item.admin_control){
        return null;
    }else{
        if(item.addons == null){
          this.onAddToCart(item)
        }else{
          this.FoodAddons(item)
        }
    }
}

    rowRenderer = (data) => {
        const { name, price, quantity, featured_image, unit, status, id,admin_control, storeId, sale_price,sale_description, brand} = data;
        return (
          <Card transparent style={{flex: 1, justifyContent: "center", alignContent: "center"  }}>
      <CardItem style={{paddingBottom: 0, marginBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0,borderRadius: 20, borderWidth:1 ,width:SCREEN_WIDTH/2-5}}>
      <TouchableOpacity style={{width:SCREEN_WIDTH/2-5, flex: 1}} onPress={()=> this.router(data) }>
      <FastImage style={styles.productPhoto} source={{ uri: featured_image, headers: { Authorization: 'someAuthToken' },
                  priority: FastImage.priority.normal, }} 
                  resizeMode={FastImage.resizeMode.cover}
      />
      <View style={{height:20,flexShrink: 1}}>
        <Text  numberOfLines={1} style={styles.categoriesStoreName}>{name}</Text>
      </View>  
            {!admin_control || !status ? 
         <View style={styles.text}>
         <Text style={styles.title}>Unavailable</Text>
       </View>
        :   quantity  <= 0  ?
        <View style={styles.text}>
        <Text style={styles.title}>Out of Stock</Text>
      </View>
        : 
         null
      }
     
     
        <Text style={{fontStyle: "italic",  fontSize: 10, paddingLeft: 20}}>Brand : {brand}</Text>
        <Text style={{fontStyle: "italic",  fontSize: 10, paddingLeft: 20}}>In Stock :{quantity}</Text>

        {sale_price ? 
         [unit ?
        <View style={{flexDirection: "row"}}>     
            <Text style={styles.categoriesPrice}>₱{sale_price}</Text>
        </View> 
        :
        <View style={{flexDirection: "row"}}>     
        <Text style={styles.categoriesPriceSale}>₱{sale_price}/ {unit}</Text>  
      </View> 
         ]
        :
        [unit ? 
        <View>
          <Text style={styles.categoriesPrice}>₱{price}</Text>
        </View>
        :
        <View>
          <Text style={styles.categoriesPrice}>₱{price}/ {unit}</Text>
        </View>
          ]
        }
    </TouchableOpacity>
    </CardItem>
    </Card>
        )
      }
    

  render() {
    const {selectedFilter, activeSlide, productss} = this.state;
    return (
      <Container style={{flex: 1}}>
       <CustomHeader title={'Search from '+this.state.store_name}  navigation={this.props.navigation}/>
        <Header searchBar rounded androidStatusBarColor={'#696969'} style={{backgroundColor: 'salmon', elevation: 0}}>
          <Item style={{padding: 5}}>
                <Fontisto name="search" size={20} color={"#000000"}/>
                <Input placeholder="Search..."
                onChangeText={(text) => this.searchFilterFunction(text)}
                style={{marginTop: 9}} />
          </Item>
          <Button transparent>
            <Text>Search</Text>
          </Button>
        </Header>
        {this.searchFilterFunction &&
        <FlatList
          data={this.state.data}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          renderItem={({ item }) => this.rowRenderer(item.datas)}
          enableEmptySections={true}
          style={{ marginTop: 10 }}
          numColumns={2}
          columnWrapperStyle={{justifyContent:'space-between'}}
          keyExtractor={(item, index) => index.toString()}
          /> }
          <Modal
          isVisible={this.state.isVisibleAddons}
          onBackButtonPress={() => this.setState({ isVisibleAddons: false })}
          animationInTiming={500}
          animationOutTiming={500}
          useNativeDriver={true}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          style={style.modal}>
               
        <ScrollView style={styles.container}>
        
        <View style={styles.carouselContainer}>
          <View style={styles.carousel}>      
          
           <Carousel
              ref={c => {
                this.slider1Ref = c;
              }}
              data={this.state.image}
              renderItem={this.renderImage}
              sliderWidth={SCREEN_WIDTH}
              itemWidth={SCREEN_WIDTH}
              inactiveSlideScale={1}
              inactiveSlideOpacity={1}
              firstItem={0}
              loop={false}
              autoplay={false}
              autoplayDelay={500}
              autoplayInterval={3000}
              onSnapToItem={index => this.setState({ activeSlide: index })}
            />
            <Pagination
              dotsLength={this.state.image.length}
              activeDotIndex={activeSlide}
              containerStyle={styles.paginationContainer}
              dotColor="rgba(255, 255, 255, 0.92)"
              dotStyle={styles.paginationDot}
              inactiveDotColor="white"
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
              carouselRef={this.slider1Ref}
              tappableDots={!!this.slider1Ref}
            />
          </View>
        </View>
        <View>
            <Text style={styles.infoRecipeName}>{this.state.name}</Text>
            <Text style={{fontSize: 17, textAlign: 'center'}}>₱{this.state.price}</Text>
          <View style={{ flex: 1, padding: 10, backgroundColor: "white" }}>
        {productss.map((object, d) =>       
          <View key={d}>
            <Divider />
            <Text style={{ fontSize: 15, marginVertical: 5, fontWeight:'bold', marginLeft: 10 }}>{object.title}</Text>
            {object.data.map((drink, i) =>
              <View key={i}>
                <CardItem style={{ flexDirection: 'row',flex:1}} button onPress={() => this.checkDrink(drink, object.data)} >
                    <View  style={{justifyContent: "flex-start"}}>
                        <RadioButton value={drink.price} status={drink.isChecked} onPress={() => this.checkDrink(drink, object.data)}/>
                    </View>
                    <View style={{justifyContent: "flex-start", flex: 5}}>
                        <Text style={{ fontSize: 12}}>{drink.label}</Text>
                    </View>
                    <View style={{justifyContent: "flex-end", flex:1}}>
                        <Text style={{ fontSize: 13 }}>₱{drink.price}</Text>
                    </View>                  
                </CardItem>
              </View>
            )}
          </View>
        )}
      </View>
          
        </View>
      </ScrollView>
      <CardItem style={{flexDirection:'row', justifyContent:"space-around"}}>
        <Left style={{flexDirection:'row', justifyContent:"space-evenly"}}>
         <Button  transparent onPress={()=> this._decrementCount()}>
            <AntDesign name="minus" size={30} color={"tomato"}/>
          </Button>
          <Button transparent>
            <Text style={{ fontSize: 25, textAlign: "center", color: "black"}}>{this.state.count}</Text>
          </Button>
          <Button  transparent onPress={()=> this._incrementCount()}>
            <AntDesign name="plus" size={30} color={"tomato"}/>
          </Button>
        </Left>
        <Right>
            <Button block style={{backgroundColor: 'tomato'}} onPress={()=> this.addonsAddtoCart(this.state.addonss)}>
                <Text>Add to Cart</Text>
            </Button>
        </Right>  
      </CardItem>
      <TouchableHighlight onPress={()=> this.setState({isVisibleAddons: false})} style={styles.btnContainer}>
                    <AntDesign name="closecircleo" size={20} color={"salmon"}/>
                </TouchableHighlight>
    </Modal>
      </Container>

    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1
  },

  headerContainer: {
    marginTop: 5
  },
  headerText: {
    color:'black'
  },
  tabItemContainer: {
    backgroundColor: "#cf6bab"
  },
  content: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modal: {
    backgroundColor: 'white',
    margin: 0, // This is the important style you need to set
    alignItems: undefined,
    justifyContent: undefined,
  },
  drinkCard: {
    paddingLeft: 2,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: 'white',
    height: 40,
  }
});