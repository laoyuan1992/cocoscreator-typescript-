import Singleton from "../../Common/Function/Singleton";
import NetManager from "../../Common/Net/NetManager";
import Dictionary from "../../Common/DataStruct/Dictionary";
import EventName from "../../Common/Event/EventName";
import HttpUtils from "../../Common/Net/httpUtils";
import URLConfig from "../../Config/URLConfig";
import DynamicLoadModule from "../../Config/DynamicLoadModule";
import Util from "../../Utility/Util";
import  { ShopItem, ShopTable } from "./ShopTable";
import MessageModule from "../../Message/Model/MessageModule";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";

//-------------------------------------------------------------------------------------------------
// 商店模块
//-------------------------------------------------------------------------------------------------
class ShopModule extends Singleton
{
    private mCurrencyName  = {};
    private mShopKindTable = new Dictionary();
    private mHttpUtils     = new HttpUtils();
    
    public Init()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.mCurrencyName[ProtoBuf.TCurrencyType.TCT_RMB]       = { name : "元"     , Image : ""              , Atlas : ""     };
        this.mCurrencyName[ProtoBuf.TCurrencyType.TCT_BEAN]      = { name : "纸蛙豆" , Image : "icon_beans"    , Atlas : "Hall" };
        this.mCurrencyName[ProtoBuf.TCurrencyType.TCT_DIAMOND]   = { name : "钻石"   , Image : "icon_diamond"  , Atlas : "Hall" };
        cc.systemEvent.on( EventName.NET_DO_SHOP_BUY , this.DoRecvBuySucceed ,this );
    }

    //请求加载商店数据
    private LoadShopData()
    {
        if( this.mShopKindTable.Size() > 0 )
        {
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_SHOP );
            return;
        }
       
        let HostUrl      : string   = URLConfig.GetURLConfig( URLConfig.ShopTableType );
        let ConfigModule : number	= DynamicLoadModule.DynamicLoadModuleType.LOAD_SHOP_MODULE;
        let ConfigKind   : number	= DynamicLoadModule.DynamicLoadMatchKind.LOAD_COMMON_SHOPTYPE_CONFIG;
        let CurTime 	 : number	= Date.now();
        let Query        : string	= "notuse";
        let SigParam     : string   = "" + ConfigModule + ConfigKind + CurTime + Query + "jjconfigload.publish";
        SigParam = Util.GetMD5( SigParam );
        let PostParam    : string   = "module="+ ConfigModule;
        PostParam += "&" + "kind="          + ConfigKind;
        PostParam += "&" + "time="          + CurTime;
        PostParam += "&" + "sql="           + Query;
        PostParam += "&" + "sig="           + SigParam;             
        this.mHttpUtils.HttpPost( HostUrl , PostParam, (this.CallBackShopInfo.bind(this)) ); 
    }

    private CallBackShopInfo( data )
    {
        if ( data == -1 ) return;
        var json = JSON.parse( data );
        if( json <= 0 ) return;
        if ( json["failed"] != null )
        {
            console.log( " auth account failes ... " );
            return;
        }
        else if ( json["md5 fail"] != null )
        {  
            console.log( " md5 fail ... " );
            return;
        }
        for( let i = 0 ; i < json.length ; i++ )
        {
            let TableInfo = new ShopTable();
            TableInfo.FillShopKind(json[i]);
            this.mShopKindTable.Add( TableInfo.Order , TableInfo );
        }
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_SHOP );
    }

    //获取商店全部数据列表
    public GetShopKindTable()
    {
        return this.mShopKindTable;
    }

    //获取商店道具列表
    public GetItemList( Key )
    {
        let Table = this.mShopKindTable.GetItem( Key );
        if( Table == null ) return;
        return Table.ShopItems;
    }

    //获取货币类型参数
    public GetCurrencyName( Kind )
    {
        if( Kind == null ) return;
        let NumKind = parseInt( Kind );
        let ProtoBuf = NetManager.GetProtobuf();
        if(  NumKind < ProtoBuf.TCurrencyType.TCT_RMB || NumKind > ProtoBuf.TCurrencyType.TCT_COUPON )
        {
            return null;
        }
        return this.mCurrencyName[NumKind];
    }

    //商城购买物品
    public SendShopBuy( ItemData : ShopItem )
    {
        if( ItemData == null ) return;
        let ProtoBuf = NetManager.GetProtobuf();
        if( ItemData.CurrencyType == ProtoBuf.TCurrencyType.TCT_RMB )
        {
            //添加支付 
        }
        else
        {
            MessageModule.ShowMessage(16);
            let msg = new ProtoBuf.MsgUpdateValue();
            msg.ext64_0 = ItemData.AutoID;
            NetManager.SendMessage( EventName.NET_DO_SHOP_BUY, msg );
        }
    }

    //处理商城购买信息
    private DoRecvBuySucceed( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgBool );
        if( msg.val == true )
        {
            MessageModule.ShowMessage(57);
        }
        UIManager.DestroyUI(UIType.UI_SHOPPROMPTING);
    }

}
export default ShopModule.GetInstance();
