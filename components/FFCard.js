import React, {Component} from 'react';
import { StyleSheet, View, Dimensions,  Image, TouchableOpacity, Alert ,TextInput, TouchableHighlight, ScrollView} from 'react-native';
import { Col, Card, CardItem, Body, Button, Left, ListItem, List, Content, Thumbnail, Right, Text,Grid, Icon,  Container, Header,Toast, Root } from 'native-base';

import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import {LayoutUtil} from './LayoutUtil';
const SCREEN_WIDTH = Dimensions.get('window').width;
import styles from './styles'
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from 'react-native-modal';
import { RadioButton, Divider } from 'react-native-paper';
import Loader from './Loader';
 
import AntDesign from 'react-native-vector-icons/AntDesign'

  
export default class FFCard extends Component {

  constructor(props) {
    super(props);
    this.cartRef =  firestore().collection('cart');
    this.state = {
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }),
      layoutProvider: LayoutUtil.getLayoutProvider(0),
      viewType: 1,
      limit: 50,
      lastVisible: null,
      loading: false,
      refreshing: false,
      showMoreBtn: true,
      products:[],
      qty: 0,
      sale: false,
      count: 1,
      selectedFilter: 'Alphabetical-(A-Z)',
      searchEnabled: false,
      cart: [],
      showToast: false,
      isVisibleAddons: false,
      name: '',
      price: 0,
      image: [],
      id: '',
      sale_price: 0,
      unit: '',
      brand: '',
      activeSlide: 0,
      selectedFruits: [],
      addonss:[],
      choice:[],
      productss: []
    };
    this.onAddToCart = this.onAddToCart.bind(this);
  }

  openModal (){
    this.setState({   
        visibleModal: true,
    })
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
   
    let newItem = {
                id: item.id,
                store_name: this.props.store,
                notification_token: this.props.token,
                note: '',
                qty: this.state.count,
                cluster: item.cluster,                
            };
            let cartRef =  firestore().collection('cart');
            let updatedCart =[];
            /* Push new cart item */
            updatedCart.push(newItem); 
            cartRef.doc(userId).set(Object.assign({}, updatedCart));
}

async addonsdeleteCart(item){
  const userId= await AsyncStorage.getItem('uid');
  AsyncStorage.setItem('cluster', item.cluster);
   firestore().collection('cart').doc(userId).delete()  
  .catch(function(error) {
      console.log("Error deleting documents: ", error);
  });
 
  let newItem = {
              id: item.id,
              store_name: this.props.store,
              total_addons: this.getAddonsTotal(),
              notification_token: this.props.token,
              note: '',
              cluster: item.cluster,     
              choice: this.getAddonsDefault(),
              qty: this.state.count,           
          };
          let cartRef =  firestore().collection('cart');
          let updatedCart =[];
          /* Push new cart item */
          updatedCart.push(newItem); 
          cartRef.doc(userId).set(Object.assign({}, updatedCart));

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
          store_name: this.props.store,
          notification_token: this.props.token,
          total_addons: this.getAddonsTotal(),
          note: '',
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
      'Note',
      'This store belongs to another cluster, adding this product will delete the items in your cart.',
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
 
 	async onAddToCart(item) {
    const {cart} = this.state;
		const userId= await AsyncStorage.getItem('uid');
	  if(userId){ 
      let id = item.id;
      let cluster = item.cluster
      let cluster_is_existing =Object.keys(cart).length && Object.values(cart).find(item => cluster === item.cluster);
      if ( cluster_is_existing == 0 || cluster_is_existing){
          AsyncStorage.setItem('cluster', item.cluster);
          let is_existing = Object.keys(cart).length && Object.values(cart).find(item => id === item.id); /* Check if item already exists in cart from state */
          if(!is_existing){
            let newItem = {
                id: item.id,
                store_name: this.props.store,
                notification_token: this.props.token,
                note: '',
                qty: 1,
                cluster: item.cluster,
            };
            let updatedCart = Object.values(cart); /* Clone it first */
            let cartRef =  firestore().collection('cart');
            
            /* Push new cart item */
            updatedCart.push(newItem); 
            
            /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
            cartRef.doc(userId).set(Object.assign({}, updatedCart)).then(() => {
            
            });
            
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
        'Note',
        'This store belongs to another cluster, adding this product will delete the items in your cart.',
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
        for(var value of choice){
          if(item.indexOf(value) === -1){
              item.push(value);
          }
      }
        return item;
    }


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
  
    onSelectionsChange = (selectedFruits) => {
        // selectedFruits is array of { label, value }
        this.setState({ selectedFruits })
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

  rowRenderer = (type, data) => {
    const { name, price, quantity, featured_image, unit, status, id,admin_control, storeId, sale_price,sale_description, brand ,cluster, addons} = data;
    return (
      <Card transparent style={{flex: 1, justifyContent: "center", alignContent: "center" }}>
      <CardItem style={{backgroundColor:'#fff1f3', paddingBottom: 0, marginBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0,borderRadius: 20, borderWidth:0.5 }}>
      <TouchableOpacity style={{width:SCREEN_WIDTH/2, flex: 1}} onPress={()=> this.router(data) }>
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
        <View style={{flexDirection: "row"}}>
        <Text style={styles.categoriesPrice}>₱{sale_price}</Text>
        <Text style={styles.categoriesPriceSale}>₱{price}</Text>
        </View> :
        <View>
        <Text style={styles.categoriesPrice}>₱{price}</Text>
        </View>
        }
    </TouchableOpacity>
    </CardItem>
    </Card>
    )
  }

  async componentDidMount(){  
    const userId= await AsyncStorage.getItem('uid');
    this.setState({ loading: true });   
    
    this.getAddonsDefault();


    this.loadProducts(false, true);
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

  /* On unmount, we remove the listener to avoid memory leaks from using the same reference with the off() method: */
  componentWillUnmount() {
    this.unsubscribeCartItems;
		this.unsubscribeProduct && this.unsubscribeProduct();
  }


  loadProducts(loadmore, fromComponent) {
    const self = this;
    var productQuery =  firestore().collection('products').where('category', 'array-contains', this.props.title);
    productQuery = productQuery.where('storeId', '==', this.props.storeId);
    
    if( this.state.searchEnabled ){
			/* If request is from a search (onChangeSearch();), we clear out the product list then load the new search results */
			/* We identify weather the trigger is from a search or a load more button click using "searchEnabled" state */
			this.setState({
				products: [],
				searchEnabled: false
			});
		}

    switch(this.state.selectedFilter) {
      case 'Price-Ascending':
				productQuery = productQuery.orderBy('price', 'asc');
        break;
      case 'Price-Descending':
        productQuery = productQuery.orderBy('price', 'desc');
         break;
			case 'Alphabetical-(A-Z)':
				productQuery = productQuery.orderBy('name', 'asc');
				break;
			case 'Alphabetical-(Z-A)':
				productQuery = productQuery.orderBy('name', 'desc');
				break;
			case 'On Sale':
				productQuery = productQuery.where('sale_price', '>', 0);
				break;	
			default: 
				productQuery = productQuery.orderBy('price', 'asc');
		}
		productQuery = productQuery.limit(50);
		/* If there's a last item set, we start the query after that item using startAfter() method */
		if( loadmore && this.state.lastVisible ){
			productQuery = productQuery.startAfter(this.state.lastVisible); 
		}
		
		this.unsubscribeProducts = productQuery.onSnapshot(snapshot => { /* The onSnapshot() method registers a continuous listener that triggers every time something has changed, use get() to only call it once (disable realtime) */
			let productChunk = [];
			
			snapshot.docChanges().forEach(function(change) {
				if (change.type === "added") {
					/* Add more items to the screen... */
					productChunk.push({ ...change.doc.data(), pid: change.doc.id });
				} else if (change.type === "modified") {
					/* If there is a change in realtime... */
					/* Apply the modification to the item directly without changing the current item index. */
					self.setState({
						products: self.state.products.map(el => (el.pid === change.doc.id ? {...change.doc.data(), pid: change.doc.id} : el))
					});
				} else if(change.type === "removed"){
					let updatedProductList = Object.values(self.state.products); /* Clone it first */
					let itemIndex = updatedProductList.findIndex(item => change.doc.id === item.pid); /* Get the index of the item we want to delete */
					
					/* Remove item from the cloned cart state */
					updatedProductList.splice(itemIndex, 1); 
					/* Update state to remove item from screen */
					self.setState({
						products: updatedProductList
					});
				}
			});
			
			this.setState((prevState) => ({
                products: prevState.products && fromComponent ? [...prevState.products, ...productChunk]: productChunk,
                dataProvider: this.state.dataProvider.cloneWithRows(
                    prevState.products && fromComponent ? [...prevState.products, ...productChunk]: productChunk
                  ),
				loading: false,
				loadingBtn: false,
				lastVisible: snapshot.docs[snapshot.docs.length - 1], 
        showMoreBtn: productChunk.length < this.state.limit ? false : true, 
        visibleModal: false
      }));
		});
  };

  renderFooter = () => {
    try {
      // Check If Loading
      if (this.state.showMoreBtn) {
        return (
            <Button block success success style={{margin: 5}} onPress={()=>this.loadProducts(true, true)}>
            <Text>Load More</Text>
          </Button>
        )
      }
      else {
        return(
          <Text style={{ justifyContent: "center", alignSelf: "center", color:'#f0ac12', paddingVertical: 5}}>End of result.</Text>
        );
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  render() {
       const {selectedFilter, activeSlide, productss} = this.state;
    return (
      <Root>
      <Container style={{flex: 1,
        backgroundColor: '#FFF',

       }}>
              
          <Header androidStatusBarColor={'#696969'}  style={{backgroundColor:'salmon', height: 46}}>
          <View style={{flex: 1,flexDirection:'row', width: 200, height: 36, justifyContent: "center", alignItems: 'center',backgroundColor:'white', marginTop: 5,borderRadius: 30}}>
          <TouchableOpacity style={{alignItems:'center',justifyContent:'center', flexDirection:'row',  }} onPress = {()=>{this.props.navigation.navigate('Search', {'storeId': this.props.storeId, 'store_name': this.props.store})}} underlayColor = 'transparent'>
              <View style={{flex: 1}}>
                <Text style={{justifyContent: "center", alignSelf: "center"}}>Search</Text>
              </View>
          
                  <View style={{paddingRight: 10}}>
                  <Fontisto name="search" size={20} color={"#000000"}/>
    
                  </View>
              </TouchableOpacity>
          </View>
            <Left style={{flexDirection: "row", paddingLeft: 10}}>
            <FontAwesome name="sliders" size={20} color={"#FFFFFF"}/>
            <TouchableOpacity style={{paddingLeft: 10}} onPress={()=>this.openModal()}>
                <Text style={{color: '#FFFFFF'}}>Filters</Text>
              </TouchableOpacity>
            </Left>
        </Header>
        <Loader loading={this.state.loading}/>
        <RecyclerListView
          style={{flex: 1, marginHorizontal: 5}}
          rowRenderer={this.rowRenderer}
          dataProvider={this.state.dataProvider}
          layoutProvider={this.state.layoutProvider}
          renderFooter={this.renderFooter}
        />
        
          <Modal
            isVisible={this.state.visibleModal}
            animationInTiming={1000}
            animationIn='slideInUp'
            animationOut='slideOutDown'
            animationOutTiming={1000}
            useNativeDriver={true}
            onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
           <View style={style.content}> 
           <Text style={{justifyContent: "center", textAlign:"center", paddingVertical: 10, color: 'salmon', fontWeight:'bold'}}>Select Filter</Text>
           <Divider />
           <View style={{flexDirection: 'row'}}>
                    <RadioButton
                    value="Price-Ascending"
                    status={selectedFilter === 'Price-Ascending'? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ selectedFilter: 'Price-Ascending' }); }}
                    />
                    <Text style={{padding: 5}}>Price-Ascending</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <RadioButton
                    value="Price-Descending"
                    status={selectedFilter === 'Price-Descending'? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ selectedFilter: 'Price-Descending' }); }}
                    />
                    <Text style={{padding: 5}}>Price-Descending</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <RadioButton
                    value="Alphabetical-(A-Z)"
                    status={selectedFilter === 'Alphabetical-(A-Z)'? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ selectedFilter: 'Alphabetical-(A-Z)' }); }}
                    />
                    <Text style={{padding: 5}}>Alphabetical-(A-Z)</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <RadioButton
                    value="Alphabetical-(Z-A)"
                    status={selectedFilter === 'Alphabetical-(Z-A)'? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ selectedFilter: 'Alphabetical-(Z-A)' }); }}
                    />
                    <Text style={{padding: 5}}>Alphabetical-(Z-A)</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <RadioButton
                    value="On Sale"
                    status={selectedFilter === 'On Sale'? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ selectedFilter: 'On Sale' }); }}
                    />
                    <Text style={{padding: 5}}>On Sale</Text>
                </View>
                <Button bordered  block style={{marginVertical: 10, justifyContent: "center", textAlign: 'center', borderColor:'salmon'}} onPress={()=> this.loadProducts()}>
                  <Text style={{color:'salmon'}}>Done</Text>
                </Button>
          </View>
          </Modal>
          <Modal
          isVisible={this.state.isVisibleAddons}
          onBackButtonPress={() => this.setState({ isVisibleAddons: false })}
          animationInTiming={500}
          animationOutTiming={500}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          useNativeDriver={true}
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
            <AntDesign name="minus" size={30} color={"salmon"}/>
          </Button>
          <Button transparent>
            <Text style={{ fontSize: 25, textAlign: "center", color:'black'}}>{this.state.count}</Text>
          </Button>
          <Button  transparent onPress={()=> this._incrementCount()}>
            <AntDesign name="plus" size={30} color={"salmon"}/>
          </Button>
        </Left>
        <Right>
            <Button block style={{backgroundColor: 'salmon'}} onPress={()=> this.addonsAddtoCart(this.state.addonss)}>
                <Text>Add to Cart</Text>
            </Button>
        </Right>  
      </CardItem>
      <TouchableHighlight onPress={()=> this.setState({isVisibleAddons: false})} style={styles.btnContainer}>
                    <AntDesign name="closecircleo" size={20} color={"salmon"}/>
                </TouchableHighlight>
    </Modal>
      </Container>
      </Root>
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