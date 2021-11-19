import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {  StyleSheet,  Image,  Text,  TouchableOpacity,  View,  FlatList,  Alert,  TextInput,  CheckBox, Dimensions, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetApis, PostApis } from "../Common/CallApi";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Theme from "../constants/Theme";
import { Button } from "react-native-paper";
import SHModelPicker from "../components/controls/SHModelPicker";
import {SHMultiselectDropdown} from '../components/controls/SHDropdown';
import moment from "moment";
import axios from 'axios';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Spinner from 'react-native-loading-spinner-overlay';
import SHRNPicker from "../components/controls/SHRNPicker";
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location";
import Communications from 'react-native-communications';
import { APIURL, APILOCAL, AUTHORIZATION } from "@env";
const haversine = require('haversine');
let bodyFormData1 = new FormData();

//màn hình chi tiết một ca xử lý
//Thuongpv 20210823
const ProcessDetails = (props) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isChecked, setisChecked] = useState(false);
    const[listInfoImage, setListInfoImage] = useState([]);
    //const widthImage = 90; // độ rộng của một ảnh trong danh sách ảnh
    //const numColumns = parseInt(Dimensions.get('window').width / widthImage); // số cột hiển thị ảnh
    const [objReturn, setObjReturn] = useState({}); // đối tượng tham số trả lại ca
    const [detailProcessing, setDetailProcessing] = useState({"WarrantyOnsiteItem": {}, "SourceWarrantySolution": [], "SourceWarrantyTErrorGroup": [], "SourceWarrantyTechnicalError": [], "SourceImage": []}); //chi tiết 1 ca xử lý
    const timeNow = moment().format("DD/MM/YYYY HH:mm:ss");
    const [listGroupError, setListGroupError] = useState([{id: " ", name: " "}]); //danh sách nhóm lỗi
    const [groupErrorTxt, setGroupErrorTxt] = useState(""); // text nhóm lỗi
    const [listSolution, setListSolution] = useState([{id: " ", name: " "}]); //danh sách giải pháp
    const [solutionTxt, setSolutionTxt] = useState(""); // text giải pháp
    const [listItemError, setListItemError] = useState([{label: "", value: ""}]); // danh sách linh kiện lỗi
    const [listItemErrorTxt, setListItemErrorTxt] = useState([]); //danh sách linh kiện lỗi khi chọn
    const [ListItemReplace, setListItemReplace] = useState([]); //biến danh sách linh kiện đã thay vào ca bảo hành
    const [CaculateServiceFee, setCaculateServiceFee] = useState(0); //biến phí dịch vụ
    const [ItemFee, setItemFee] = useState(0); //biến phí linh kiện
    const [serialNumber, setSerialNumber] = useState(""); //số serial
    const [TEGID, setTEGID] = useState(null); //nhóm lỗi
    const [TechnicalError, setTechnicalError] = useState("");//lỗi sau khi kiểm tra
    const [TechnicalSolution, setTechnicalSolution] = useState("");//WSCode giải pháp
    const [loading, setLoading] = useState(false);

    const [isService, setIsService] = useState(false); //Nếu là ca dịch vụ thì được phép nhập phí dịch vụ (02.11.2021);
    

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); //bật tắt lịch chọn ngày
    const today = new Date(new Date().setHours(0, 0, 0, 0)); //lấy ra ngày hiện tại
    const strtoday = moment(today).format("DD-MM-YYYY"); //lấy ra ngày hiện tại với định dạng str
    var [manufactureDate, setManufactureDate] = useState(today); //ngày sản xuất
    var [strManufactureDate, setstrManufactureDate] = useState(); //ngày sản xuất với định dạng str
    // var [strManufactureDate, setstrManufactureDate] = useState(objData.strManufactureDate); //ngày sản xuất với định dạng str
    var [typeDate, setTypeDate] = useState("manufactureDate"); //kiểu ngày truyền vào
    var [purchaseDate, setPurchaseDate] = useState(today); //ngày mua
    var [strPurchaseDate, setstrPurchaseDate] = useState();//ngày mua với định dạng str
    // var [strPurchaseDate, setstrPurchaseDate] = useState(objData.strBuyDate);//ngày mua với định dạng str

    useEffect(() => {
        if (isFocused) {
            getDetailProcessing();
            getListItemReplace();
         }
    }, [props, isFocused, isChecked]);

    useEffect(() => {
        if (isFocused) {
            setListInfoImage(listInfoImage)
         }
    }, [listInfoImage]);

    //hàm chọn model theo loại truyền vào
    const showDatePicker = (typeDate) => {
        setDatePickerVisibility(true);
        setTypeDate(typeDate);
    };

    //hàm xử lý sự kiện chọn ngày
    const handleConfirm = (date) => {
        hideDatePicker();
        if (typeDate == "manufactureDate") {
            setDetailProcessing({ ...detailProcessing,
                WarrantyOnsiteItem: {...detailProcessing.WarrantyOnsiteItem,
                    ManufactureDate: moment(date).format(), 
                    strManufactureDate: moment(date).format("DD-MM-YYYY").toString() }
            })
            setstrManufactureDate(moment(date).format("DD-MM-YYYY").toString());
            setManufactureDate(date);
        } else {
            setDetailProcessing({ ...detailProcessing, 
                WarrantyOnsiteItem: {...detailProcessing.WarrantyOnsiteItem,
                    BuyDate: moment(date).format(), 
                    strBuyDate: moment(date).format("DD-MM-YYYY").toString() }
            })
            setstrPurchaseDate(moment(date).format("DD-MM-YYYY").toString());
            setPurchaseDate(date);
        }
    };
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    //hàm lấy ra chi tiết một ca xử lý
    const getDetailProcessing = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null){userName = JSON.parse(userLogin).UserName}
            await GetApis('KTV', 'GetProcessDetail', { WOIID: props.dataDetail, loginUser: userName }, 10000 ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined || data != null) {
                        //console.log(data.WarrantyOnsiteItem);
                        // if(data.WarrantyOnsiteItem.CustomerRequest == 'Service') {
                        //     setIsService(true);
                        // }
                        setDetailProcessing(data);
                        if(data.WarrantyOnsiteItem.ManufactureDate){
                            //console.log(data.WarrantyOnsiteItem);
                            setstrManufactureDate(moment(data.WarrantyOnsiteItem.ManufactureDate).format("DD-MM-YYYY").toString());
                            setManufactureDate(data.WarrantyOnsiteItem.ManufactureDate);
                        }
                        if(data.WarrantyOnsiteItem.BuyDate){
                            setstrPurchaseDate(moment(data.WarrantyOnsiteItem.BuyDate).format("DD-MM-YYYY").toString());
                            setPurchaseDate(data.WarrantyOnsiteItem.BuyDate);
                        }
                        setisChecked(data.WarrantyOnsiteItem.IsValid);
                        var newListGroupError = data.SourceWarrantyTErrorGroup.map((e) => { e.name = e.TEGName; e.id = e.TEGID; return e});
                        setListGroupError(newListGroupError);
                        var newListItemError = data.SourceWarrantyTechnicalError.map((e) => { e.label = e.TEName; e.value = e.TEID; return e});
                        setListItemError(newListItemError);
                        setObjReturn({...objReturn, WOIID: data.WarrantyOnsiteItem.WOIID});
                        setListInfoImage(data.SourceImage);
                    } else { setDetailProcessing({}); }
                }else {Alert.alert('Lỗi', newres.ResponseMessenger)}
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }

    //Hàm lấy danh sách linh kiện đã chọn để thay thế
    const getListItemReplace = async () => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = ''; 
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetWarrantyProcessReplacePart',
                {   
                    WOIID: props.dataDetail,
                    loginUser: userName,
                },
                10000
            ).then((newres) => { 
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined) {
                        let newItemFee = 0;
                        data.forEach(element => {
                            newItemFee += (element.prijs83 * element.Quantity) ;
                        });
                        if(isChecked){
                            newItemFee = 0;
                        }
                        setItemFee(newItemFee);
                        setListItemReplace(data);
                    } else { setListItemReplace([]); }
                }else {Alert.alert('Lỗi', newres.ResponseMessenger)}
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }

    //Hàm tính phí dịch vụ
    const getCaculateServiceFee = async (WSCode) => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = ''; 
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'CaculateServiceFee',
                {   
                    WOIID: props.dataDetail,
                    IsValid: isChecked,
                    WSCode: WSCode,
                    loginUser: userName,
                },
                10000
            ).then((newres) => { 
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined) {
                        setCaculateServiceFee(data);
                    } else { setCaculateServiceFee(0); }
                } else { Alert.alert('Lỗi', newres.ResponseMessenger)}
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }

    //hàm lấy set danh sách giải pháp theo nhóm lỗi
    const setListSolutions = async (id) => {
        let userLogin = await AsyncStorage.getItem('userLogin');
        let role = 'ktvSH';
        if (userLogin && JSON.parse(userLogin) != null && JSON.parse(userLogin).Role){
            role = JSON.parse(userLogin).Role;
        }
        let ids = 0;
        setSolutionTxt("");
        //dieu kien tai khoan tram thi se khong co giai phap sua&thay
        var newListSolution = [];
        if (role == 'wdm' || role == 'ktvwdm') {
            newListSolution = detailProcessing.SourceWarrantySolution.filter((e) => {
             if(e.TEGID == id && e.WSCode != 'FixReplace') { 
                 e.name = e.WSName; e.id = ids; ids++ ;
                 return e}
             });
        } else {
            newListSolution = detailProcessing.SourceWarrantySolution.filter((e) => {
             if(e.TEGID == id) { 
                 e.name = e.WSName; e.id = ids; ids++ ;
                 return e}
             });
        }
        setListSolution(newListSolution);
        //thêm điều kiện nếu người dùng chọn nhóm dịch vụ thì có thể sửa phí dịch vụ
        if(id == '63FAF8DF-73B6-4E08-9AF1-45824E5E6CEA'){
            setIsService(true);
        }else { setIsService(false); }
        
    }
    // hàm chuyển sang màn hình AddItemReplace
    const AddItemReplace = (item) => {
       navigation.navigate('AddItemReplace', {item, isChecked, setisChecked});
    }
    //hàm chuyển màn hình BarCodeScannerScreen
    const BarCodeScannerScreen = () => {
        navigation.navigate('BarCodeScanners', {serialNumber, setSerialNumber});
    }

    //check còn bảo hành
    const changeChecked = async () => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = ''; 
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'CheckIsValid',
                {   
                    WOIID: props.dataDetail,
                    loginUser: userName,
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    getDetailProcessing();
                }
                else{
                    Alert.alert('lỗi chọn lựa chọn');
                }
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
    };

    //thông báo xác nhận hoàn thành ca
    const confirmAlertDone = () => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc hoàn thành ca không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {saveOnsiteItemProcess()}, },
            { text: 'Không', onPress: () => { return null; }}],
            { cancelable: false },
        );
    }
    const saveOnsiteItemProcess = async  () => {
        await confirmSaveImage();
        await objSaveWarrantyOnsiteItemProcess();
    }
    //hàm thực hiện hoàn thành ca
    var objSaveWarrantyOnsiteItemProcess= async ()=>{
        //lấy tọa độ cuối và khoảng cách từ vị trí hiện tại đến khách hàng
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo','Quyền truy cập vị trí đã bị từ chối. Bạn vào cài đặt để thiết lập quyền truy cập vị trí');
            return;
        }
        let locationCurrent = null;
        locationCurrent = await Location.getLastKnownPositionAsync({});
        if(locationCurrent == null){
            locationCurrent = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Low});
        }
        //kinh độ hiện tại:
        if(locationCurrent == null) {Alert.alert('Lỗi','Không tìm thấy tọa độ để hoàn thành ca'); return;}
        let EndLatitude = locationCurrent.coords.latitude;
        let EndLongitude = locationCurrent.coords.longitude;
        let End2CusDistance = haversine({latitude: EndLatitude, longitude: EndLongitude}, {latitude: detailProcessing.WarrantyOnsiteItem.latitude, longitude: detailProcessing.WarrantyOnsiteItem.longitude}).toFixed(2);
        if(EndLatitude == null || EndLatitude == undefined || EndLongitude == null || EndLongitude == undefined || End2CusDistance == null || End2CusDistance == undefined){
            Alert.alert('Lỗi','Không xác định vị trí, khoảng cách đến vị trí khách hàng'); return;
        }

        let objDataParam = {...detailProcessing.WarrantyOnsiteItem};
        //danh sách linh kiện thay thế
        let lstItemReplace = [];
        ListItemReplace.forEach(element => {
            lstItemReplace.push({ItemCode: element.ItemCode, Quanlity: element.Quantity, RequestNumber: null})
        });
        //danh sách lỗi linh kiện
        let ArrTEID = [];
        ArrTEID = listItemErrorTxt;
        let SerialNumber = '';
        SerialNumber = serialNumber;
        let SerialNo = '';
        SerialNo = SerialNumber;
        //ckeck bảo hành
        let IsValid = isChecked;
        //ngày sửa thực tế
        let ActualFixDate = moment().format();
        let dspActualFixDate = moment().format("DD/MM/YYYY");
        let strActualFixDate = moment().format("YYYY-MM-DD");
        
        objDataParam = {...objDataParam, 
            lstItemReplace: lstItemReplace, 
            ArrTEID: ArrTEID, 
            SerialNumber: SerialNumber, 
            IsValid: IsValid,
            ActualFixDate: ActualFixDate,
            dspActualFixDate: dspActualFixDate,
            strActualFixDate: strActualFixDate,
            TEGID: TEGID,
            TechnicalSolution: TechnicalSolution,
            TechnicalError: TechnicalError,
            Note: objReturn.note,
            FeeService: CaculateServiceFee,
            FeePart: ItemFee,
            SerialNo: SerialNo, 
            CurrentStatus: 'OK',
            EndLatitude: EndLatitude,
            EndLongitude: EndLongitude,
            End2CusDistance: End2CusDistance,
            ManufactureDate: manufactureDate,
            strManufactureDate: strManufactureDate,
            BuyDate: purchaseDate,
            strBuyDate: strPurchaseDate
            }
        if(objDataParam.strManufactureDate == undefined && objDataParam.strBuyDate == undefined){ Alert.alert("Lỗi", "Không được để trống cả ngày sản xuất và ngày mua", [{ text: "Đóng" }],); return false}
        if(objDataParam.ManufactureDate != null && objDataParam.ManufactureDate > moment().format()){ Alert.alert("Lỗi", "Ngày sản xuất không được lớn hơn ngày hiện tại", [{ text: "Đóng" }],); return false}
        if(objDataParam.BuyDate != null && objDataParam.BuyDate > moment().format()){ Alert.alert("Lỗi", "Ngày mua không được lớn hơn ngày hiện tại", [{ text: "Đóng" }],); return false}
        if( objDataParam.ManufactureDate != null && objDataParam.BuyDate != null && objDataParam.ManufactureDate > objDataParam.BuyDate
            && strManufactureDate != null && strPurchaseDate != null){
            Alert.alert("Lỗi", "Ngày mua không được nhỏ hơn ngày sản xuất", [{ text: "Đóng" }],); 
            return false
            }
        if(objDataParam.TEGID == null || objDataParam.TEGID == undefined) { Alert.alert("Lỗi", "Bạn chưa chọn nhóm lỗi", [{ text: "Đóng" }],); return false }
        if(objDataParam.TechnicalSolution == null || objDataParam.TechnicalSolution == undefined || !objDataParam.TechnicalSolution) { Alert.alert("Lỗi", "Bạn chưa chọn giải pháp", [{ text: "Đóng" }],); return false }
                
        let userLogin = await AsyncStorage.getItem("userLogin");
        userLogin = JSON.parse(userLogin);
        let roles = await AsyncStorage.getItem('Role');
        if(roles == 'ktvwdm' || roles == 'wdm'){
            setLoading(true);
            var res = await PostApis('KTV', `SaveDBWarrantyOnsiteItemProcessStation?loginUser=${userLogin.UserName}`, objDataParam, 3000);
            setLoading(false);
        }else{
            setLoading(true);
            var res = await PostApis('KTV', `SaveDBWarrantyOnsiteItemProcess?loginUser=${userLogin.UserName}`, objDataParam, 3000);
            setLoading(false);
        }
        if (res.ResponseStatus == "OK") {
            if (res.ResponseData != null) {
                Alert.alert("Thông báo", "Hoàn thành ca bảo hành",[{ text: "Đóng" }],);
                navigation.navigate('ProcessingComponent');
            }
        } else {
            setTimeout(() => {
                Alert.alert(`Lỗi`, res.ResponseMessenger, [{ text: "Đóng" }],);
            }, 10);
        }
    }
    //hàm trả lại ca bảo hành
    var returnTheShift = async() => {
        let userLogin = await AsyncStorage.getItem('userLogin');
        let userName = '';
        if (userLogin && JSON.parse(userLogin) != null) userName = JSON.parse(userLogin).UserName;
        if (objReturn.note == null || objReturn.note ==''){ Alert.alert("Lỗi", "Bạn chưa nhập ghi chú",[{ text: "Đóng" }],); return false }
        setLoading(true);
        let res = await GetApis('KTV', 'CancelProcess',
                {
                    WOIID: objReturn.WOIID,
                    note: objReturn.note,
                    loginUser: userName
                },
                10000
            )
        setLoading(false);
        if (res.ResponseStatus == "OK") {
            Alert.alert("Thông báo", "Hủy ca thành công",[{ text: "Đóng" }],);
            navigation.navigate('ProcessingComponent');
        }else {
            setTimeout(() => {
                Alert.alert("Thông báo", "Hủy ca không thành công",[{ text: "Đóng" }],);
            }, 10);
        }
    }
    //thông báo xác nhận trả lại ca
    const confirmAlert = () => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc trả lại ca không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {returnTheShift()}, },
            { text: 'Không', onPress: () => { return null; }}],
            { cancelable: false },
        );
    }

    //thông báo xác nhận xóa linh kiện thay thế
    const confirmAlertDelete = (itemcode) => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc linh kiện này không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {deleteItemReplace(itemcode)}, },
            { text: 'Không', onPress: () => { return null; }}],
            { cancelable: false },
        );
    }
    
    //xóa linh kiện thay thế khỏi danh sách đã chọn
    const deleteItemReplace = async (itemcode) => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            if(itemcode == null) { Alert.alert('Lỗi', 'Linh kiện không xác định.' ); return false}
            let processid = props.dataDetail;
            if(processid == null) { Alert.alert('Lỗi', 'Ca bảo hành không xác định.' ); return false}
            setLoading(true)
            await GetApis('KTV', 'DeleteWarrantyProcessReplacePart',
                {   
                    processid: processid,
                    itemcode: itemcode,
                    loginUser: userName,
                },
                10000
            ).then((newres) => { 
                setLoading(false)
                if (newres && newres.ResponseStatus == 'OK') {
                    //console.log("Xóa thành công");
                    getListItemReplace();
                } else {
                    setTimeout(() => {
                          Alert.alert(`Lỗi`, newres.ResponseMessenger, [{ text: "Đóng" }],);
                    }, 10);
                }
            });
        } catch (error) { Alert.alert('Lỗi', 'Không xóa được linh kiện' ); setLoading(false)  }
    }

    //hàm chụp ảnh
    const pickImage = async () => {
        let isPermission = await ImagePicker.getCameraPermissionsAsync();
        if (!isPermission.granted) {
            let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Bạn chưa cấp quyền cho ứng dụng.");
                return;
            }
        }
        let result = await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [4, 3], quality: 1, });
        if (!result.cancelled) {
            result.UrlDoc = Platform.OS === "android" ? result.uri : result.uri.replace("file://", "");
            listInfoImage.push(result);
            setListInfoImage([...listInfoImage]);
        } 
    };
    //hàm chọn ảnh từ thư viện
    const chooseImage = async () => {
        let isPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!isPermission.granted) {
            let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted' ) {
                Alert.alert("Bạn chưa cấp quyền cho ứng dụng.");
                return;
            }
        }
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, aspect: [4, 3], quality: 1, });
        if (!result.cancelled) {
            result.UrlDoc = Platform.OS === "android" ? result.uri : result.uri.replace("file://", "");
            listInfoImage.push(result);
            setListInfoImage([...listInfoImage]);
        } 
    };
    //Hàm lưu ảnh
    const confirmSaveImage = async () => {
        let userLogin = await AsyncStorage.getItem('userLogin');
        let userName = '';
        if (userLogin && JSON.parse(userLogin) != null)
            userName = JSON.parse(userLogin).UserName;
        //nếu ảnh chưa được lưu thì đẩy vào bodyFormData1 để lưu
        bodyFormData1 = new FormData();
        let hasImages = false;
        listInfoImage.forEach((e) => {
            if(e.uri){
                hasImages = true;
                let filename = e.uri.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                bodyFormData1.append(filename, {
                    uri: Platform.OS === "android"
                        ? e.uri
                        : e.uri.replace("file://", ""),
                    name: filename,
                    type
                });
            }
        });
        console.log(bodyFormData1);
        if(hasImages){
            bodyFormData1.append('WOIID',detailProcessing.WarrantyOnsiteItem.WOIID);
            setLoading(true)
              axios({
                  url: `${APIURL}/KTV/UploadImageWarranty?loginCode=${userName}`,
                  method: 'POST',
                  data: bodyFormData1,
                  headers: {
                      'Content-Type': 'multipart/form-data',
                      'Authorization': `${AUTHORIZATION}`
                  }
              }).then(function (res) {
                   setLoading(false)
                  if (res && res.data.ResponseStatus == 'OK') {
                      //update lại listInfoImage cho có thuộc tính Id
                      //đầu tiên phải xóa các ảnh chưa được gán Id
                      let listInfoImageNew = listInfoImage.filter((e) => {
                          return (e.Id);
                      });
                      //thêm những ảnh đã được gán Id
                      res.data.ResponseData.forEach((element) => {
                          let newObj = {CreateDate: element.CreateDate,Id:element.Id, UrlDoc: element.UrlDoc};
                          listInfoImageNew.push(newObj);
                      });
                      setListInfoImage(listInfoImageNew);
                  } else {
                      setTimeout(() => {
                          Alert.alert(`Lỗi`, res.data.ResponseMessenger, [{ text: "Đóng" }],);
                      }, 10);
                  }
              }).catch(function (error) {
                  setLoading(false);
                  setTimeout(() => {
                      Alert.alert(error);
                  }, 10);
              });
        }
    }

    //thông báo xác nhận xóa ảnh
    const confirmDeleteImage = (item) => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc xóa ảnh này không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, 
            onPress: () => {
                //nếu ảnh chưa được lưu xuống db thì xóa luôn trên giao diện
                if(item.Id){
                    deleteImage(item.Id);
                }else{
                    setListInfoImage(listInfoImage.filter((e) => {return e.UrlDoc != item.UrlDoc}));
                }}, },
            { text: 'Không', onPress: () => { return null; }}],
            { cancelable: false },
        );
    }
    /**
    * hàm xóa ảnh trong danh sách ảnh
    * THUONGPV 23082021
    */
    const deleteImage = async (id) => {
        let userLogin = await AsyncStorage.getItem('userLogin');
        let userName = '';
        if (userLogin && JSON.parse(userLogin) != null)
            userName = JSON.parse(userLogin).UserName;
        let newres =  await GetApis('KTV', 'DeleteSHDocumentById', { id: id, loginCode: userName }, 3000) 
        if (newres && newres.ResponseStatus == 'OK') {
            if (newres && newres.ResponseStatus =='OK') {
                let newArr = [...listInfoImage.filter(e=>e.Id !=id)];
                setListInfoImage([...newArr]);
            } else {  setTimeout(() => {
                Alert.alert(res.ResponseMessenger);
            }, 10); }
        }
    };

    //vẽ một item ảnh
    const RenderItemImage = ({ item }) => {
        return (
            <View style={{ backgroundColor:'white', marginRight: 10}}>
                <TouchableOpacity style={{flex: 1,height:130, width: 70}} onLongPress={() => {confirmDeleteImage(item)}}>
                    <Image source={{uri: item.UrlDoc}}
                            style={{height:'100%', width: '100%', flex: 1}}
                            resizeMode="contain"
                            />
                </TouchableOpacity>
            </View>
        );
    };

    //vẽ một item một linh kiện thay thế
    const RenderItemReplace = ({ item }) => {
        return (
            <View style={{borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 5}}>
                <View style={{flexDirection: 'row', margin: 5}}>
                    <View style={{flex: 7}}><Text style={{color: 'blue'}}>{item.ItemName}</Text></View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress={()=>{confirmAlertDelete(item.ItemCode)}}>
                            <MaterialIcons name="delete" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection: 'row', margin: 5}}>
                    <View style={{flex: 7}}><Text>{item.ItemCode}</Text></View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}><Text style={{fontWeight: 'bold'}}>x{item.Quantity}</Text></View>
                </View>
            </View>
        );
    };

    return (
        <View>
            <Spinner visible={loading} textContent={'Loading...'} textStyle={{ color: Theme.COLORS.WHITE }} />
            <ScrollView>
                <View style={{ backgroundColor: "#E4E4E4", margin: 5, borderRadius: 5, padding: 5, }} >
                    <View style={styles.lineInfo} >
                        <View flex={5}>
                            <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.COLORS.GREEN_PORTAL, }} > {detailProcessing.WarrantyOnsiteItem.ItemName} </Text>
                        </View>
                        <View style={{flex: 2, alignItems: 'flex-end'}}>
                            <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.COLORS.GREEN_PORTAL, }} >SP: {detailProcessing.WarrantyOnsiteItem.WarrantyNumber} </Text>
                        </View>
                    </View>
                    <View style={styles.lineInfo} >
                        <View flex={5}>
                            <Text style={styles.sizeText}>
                                <FontAwesome name="user" size={15} color="black" /> {detailProcessing.WarrantyOnsiteItem.CustomerName}
                            </Text>
                        </View>
                        <View style={{flex: 2, alignItems: 'flex-end'}}>
                            <Text style={styles.sizeText} onPress={() => Communications.phonecall(detailProcessing.WarrantyOnsiteItem.CustomerPhone, true)}>
                                <FontAwesome name="phone" size={15} color="black" /> {detailProcessing.WarrantyOnsiteItem.CustomerPhone}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.lineInfo} >
                        <View>
                            <Text style={styles.sizeText}>
                                <FontAwesome name="map-marker" size={17} color="black" /> {detailProcessing.WarrantyOnsiteItem.CustomerAddress}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.lineInfo} >
                        <Text style={styles.sizeText}>
                            <FontAwesome name="hourglass-2" size={12} color="black" /> Nhận: {detailProcessing.WarrantyOnsiteItem.strTechnicianReceivedDate}
                        </Text>
                    </View>
                    <View style={styles.lineInfo} >
                        <Text style={styles.sizeText}>
                            <FontAwesome name="wrench" size={12} color="black" /> Sửa: {timeNow}
                        </Text>
                    </View>
                    <View style={styles.lineInfo} >
                        <View flex={3}>
                            <Text style={styles.sizeText}>
                                <FontAwesome name="warning" size={12} color="black" />
                                <Text style={{ color: Theme.COLORS.RED_SUNHOUSE }}> {detailProcessing.WarrantyOnsiteItem.Symptom} </Text>
                            </Text>
                        </View>
                        <View style={{flex: 2, alignItems: 'flex-end'}}>
                            <Text style={styles.sizeText}>
                                <FontAwesome name="archive" size={12} color="black" /> Hệ thống: {detailProcessing.WarrantyOnsiteItem.ChainCode}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                        <View>
                            <Text style={styles.sizeText}>
                                <FontAwesome name="list-alt" size={12} color="black" /> Call ghi chú: {detailProcessing.WarrantyOnsiteItem.Note}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 4 }}>
                        <View>
                            <Text style={styles.sizeText}> iMei/Serial </Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ flex: 3 }}>
                                <TextInput
                                    value={serialNumber}
                                    style={{ marginTop: 3, borderRadius: 5, backgroundColor: "white", paddingLeft: 5, fontSize: 12, height: 25 }} 
                                    onChangeText={(value) => { 
                                            setSerialNumber(value);
                                        }}
                                ></TextInput>
                            </View>
                            <View style={{ flex: 1, justifyContent:'flex-end'}}>
                                <TouchableOpacity onPress={() => {BarCodeScannerScreen()}}>
                                    <MaterialCommunityIcons name="barcode-scan" size={25} color="black" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 3 }}>
                        <View>
                            <Text style={styles.sizeText}> SP còn bảo hành </Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop:8}}>
                            <View style={{ flex: 1 }}>
                                <Pressable
                                    style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}
                                    onPress={changeChecked}>
                                    {isChecked && <FontAwesome name="check" size={15} color="white" />}
                                </Pressable>
                            </View>
                            <View style={{ flex: 6, justifyContent: "flex-end" }}>
                                <Text style={styles.sizeText}> Còn bảo hành </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <View>
                            <Text style={styles.sizeText}> Ngày sản xuất </Text>
                        </View>
                        <SHModelPicker 
                            style={{ flex: 1, marginTop: 3, borderRadius: 5, backgroundColor: "#E4E4E4", }} 
                            strDate={strManufactureDate} 
                            onPress={() => { showDatePicker("manufactureDate"); }} 
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}>Ngày mua</Text>
                        </View>
                        <SHModelPicker
                            style={{ flex: 1, marginTop: 3, borderRadius: 5, backgroundColor: "#E4E4E4", }}
                            strDate={strPurchaseDate}
                            onPress={() => { showDatePicker("purchaseDate"); }}
                        />
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}>Nhóm lỗi</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <SHRNPicker
                                showSearchBar={true}
                                placeHolderLabel="Chọn nhóm lỗi" 
                                dataSource={listGroupError}
                                dummyDataSource={listGroupError}
                                value={listGroupError[0].name}
                                defaultValue={true}
                                selectedLabel={groupErrorTxt}
                                selectedValue={(index, item) => {
                                    setGroupErrorTxt(item.name);
                                    setListSolutions(item.id);
                                    setTEGID(item.id);
                                }}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}> Giải pháp </Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <SHRNPicker
                                showSearchBar={true}
                                placeHolderLabel="Chọn giải pháp"
                                dataSource={listSolution}
                                dummyDataSource={listSolution}
                                value={listSolution[0].name}
                                defaultValue={true}
                                selectedLabel={solutionTxt}
                                selectedValue={(index, item) => {
                                    setSolutionTxt(item.name);
                                    getCaculateServiceFee(item.WSCode);
                                    setTechnicalSolution(item.WSCode);
                                }}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}> Linh kiện lỗi </Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 3 }}>
                            <SHMultiselectDropdown
                                data={listItemError}
                                chipType="outlined"
                                value={listItemErrorTxt}
                                onChange={(value) => {
                                    setListItemErrorTxt(value);
                                }}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}> Linh kiện thay thế </Text>
                        </View>
                        <View style={{marginTop: 3}}>
                            <TouchableOpacity onPress={() => {AddItemReplace(detailProcessing.WarrantyOnsiteItem)}}>
                                <View style={{flexDirection:'row', backgroundColor: Theme.COLORS.BACKGROUND_COLOR_GRAY_DARK, borderRadius: 5}}>
                                    <View style={{flex: 1}}>
                                        <Text style={{ padding: 5, fontSize: 12, paddingTop: 8}}>Chọn linh kiện</Text>
                                    </View>
                                    <View style={{marginRight: 10}}>
                                        <Ionicons name="ios-add-circle-outline" size={30} color="blue" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop: 5}}>
                            <FlatList
                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                data={ListItemReplace}
                                renderItem={RenderItemReplace}
                                keyExtractor={(item) => item.ItemCode}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}> Lỗi sau kiểm tra </Text>
                        </View>
                        <View>
                            <TextInput placeholder="Nhập lỗi sau kiểm tra..." 
                                value={TechnicalError}
                                style={{ marginTop: 3, borderBottomWidth: 1, padding: 5, fontSize: 12, }} 
                                onChangeText={(value) => { setTechnicalError(value) }}
                            ></TextInput>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText}>Ghi chú</Text>
                        </View>
                        <View>
                            <TextInput placeholder="Nhập ghi chú..." 
                                value={objReturn.note}
                                style={{ marginTop: 3, borderRadius: 5, backgroundColor: "#E4E4E4", padding: 5, fontSize: 12, }} 
                                onChangeText={(value) => { setObjReturn({ ...objReturn, note: value }) }}
                            ></TextInput>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <View>
                            <Text style={styles.sizeText} > Phí dịch vụ </Text>
                        </View>
                        <View style={{ flexDirection: "row", backgroundColor: "#E4E4E4", borderRadius: 5, marginTop: 3 }} >
                            <View style={{ flexDirection: "row", flex: 1 }}>
                                <TextInput value={isChecked ? '0' : CaculateServiceFee.toString()} editable={isService} keyboardType="numeric" style={{ flex: 1, marginTop: 3, padding: 5, fontSize: 16, color: 'black' }} ></TextInput>
                            </View>
                            <View style={{ justifyContent: "center", marginRight: 5, marginTop: 2, }} >
                                <Text style={{ fontWeight: "bold", fontSize: 17 }}>$</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText} > Phí linh kiện </Text>
                        </View>
                        <View style={{ flexDirection: "row", backgroundColor: "#E4E4E4", borderRadius: 5, marginTop: 3 }} >
                            <View style={{ flexDirection: "row", flex: 1 }}>
                                <TextInput value={ItemFee.toString()} editable={false} keyboardType="numeric" style={{ flex: 1, marginTop: 3, padding: 5, fontSize: 16, color: 'black' }} ></TextInput>
                            </View>
                            <View style={{ justifyContent: "center", marginRight: 5, marginTop: 2, }} >
                                <Text style={{ fontWeight: "bold", fontSize: 17 }}>$</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={styles.sizeText} > Hình ảnh </Text>
                        </View>
                        <View style={{ flexDirection: "row", flex: 1}}>
                            <TouchableOpacity style={{marginTop: 3, flex: 1, marginRight: 10}} onPress={() => {pickImage()}}>
                                <View style={{ flexDirection: "row", backgroundColor: "#E4E4E4", borderRadius: 5, }} >
                                    <View style={{ flexDirection: "row", flex: 1 }}>
                                        <TextInput editable={false} value="Chụp ảnh" style={{ flex: 1, marginTop: 3, padding: 5, fontSize: 12 }} ></TextInput>
                                    </View>
                                    <View style={{ justifyContent: "center", marginRight: 5, marginTop: 2, }} >
                                        <FontAwesome name="camera" size={20} color="black" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={{marginTop: 3, flex: 1, marginRight: 10}} onPress={() => {chooseImage()}}>
                                <View style={{ flexDirection: "row", backgroundColor: "#E4E4E4", borderRadius: 5, }} >
                                    <View style={{ flexDirection: "row", flex: 1 }}>
                                        <TextInput editable={false} value="Chọn ảnh" style={{ flex: 1, marginTop: 3, padding: 5, fontSize: 12 }} ></TextInput>
                                    </View>
                                    <View style={{ justifyContent: "center", marginRight: 5, marginTop: 2, }} >
                                        <FontAwesome name="folder-open" size={20} color="black" />
                                    </View>
                                </View>
                            </TouchableOpacity> */}
                            <TouchableOpacity style={{marginTop: 3, flex: 1}} onPress={() => {confirmSaveImage()}}>
                                <View style={{ flexDirection: "row", backgroundColor: "#E4E4E4", borderRadius: 5, }} >
                                    <View style={{ flexDirection: "row", flex: 1 }}>
                                        <TextInput editable={false} value="Lưu ảnh" style={{ flex: 1, marginTop: 3, padding: 5, fontSize: 12 }} ></TextInput>
                                    </View>
                                    <View style={{ justifyContent: "center", marginRight: 5, marginTop: 2, }} >
                                        <FontAwesome name="save" size={20} color="black" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{paddingLeft: 10}}>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        horizontal={true}
                        data={listInfoImage}
                        renderItem={RenderItemImage}
                        keyExtractor={(item) => item.UrlDoc}
                        //numColumns={numColumns}
                    />
                </View>
                <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                        <Button 
                            style={{ backgroundColor: Theme.COLORS.RED_SUNHOUSE, marginLeft: 5, marginRight: 5, marginTop: 10, }}
                            onPress={() => { confirmAlert() }} >
                            <Text style={{ color: "white", fontWeight: "bold" }}> TRẢ LẠI CA </Text>
                        </Button>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button 
                            style={{ backgroundColor: Theme.COLORS.GREEN_PORTAL, marginLeft: 5, marginRight: 5, marginTop: 10, }} 
                            onPress={() => { confirmAlertDone() }} >
                                <Text style={{ color: "white", fontWeight: "bold" }}> HOÀN THÀNH </Text>
                        </Button>
                    </View>
                </View>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    lineInfo: { flexDirection: "row", marginBottom: 7 },
    sizeText: { fontSize: 11, fontWeight: "bold" },
    checkboxBase: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Theme.COLORS.GREEN_PORTAL,
    },
    checkboxChecked: { backgroundColor: Theme.COLORS.GREEN_PORTAL }
})

export default ProcessDetails;
