import Singleton from "../../Common/Function/Singleton"
import HttpUtils from "../../Common/Net/httpUtils"
import URLConfig from "../../Config/URLConfig";
import Util from "../../Utility/Util";
import StringHelper from "../../Utility/StringHelper";
import EventName from "../../Common/Event/EventName";
import Dictionary from "../../Common/DataStruct/Dictionary";
import LoginAuthAccountModule from "../../Login/Model/LoginAuthAccountModule";

class WeChatInfo 
{
    public  Name      : string            = "";
    public  HeadTex   : cc.Texture2D      = null;
    public  Sex       : number            = null;
    public  HeadUrl   : string            = ""; 
    public  RoleID    : number            = 0;
    public  UserName  : string            = "";
    public  TimeOut   : number            = 0;
    private HttpUtils : HttpUtils         = new HttpUtils();

    //请求微信信息
    public RequestWxInfo()
    {
        let CeShiWXUrl : string = URLConfig.GetURLConfig( URLConfig.WeChatInfo );
        let CurrTime   : number = Date.now();
        let DeviceId   : string = "HeadPoolModule";
        let SigParam   : string = this.UserName + CurrTime.toString() + DeviceId + "WX_FSDF823R@R234!"; 
        SigParam = Util.GetMD5( SigParam );
    
        let PostParam:string  = "device_id="    + DeviceId;
        PostParam    += "&"   + "time="           + CurrTime.toString();
        PostParam    += "&"   + "open_id="        + this.UserName;
        PostParam    += "&"   + "sig="            + SigParam;

        this.HttpUtils.HttpPost( CeShiWXUrl , PostParam, (this.CallBackHandler.bind(this))  );
    }

    //请求微信贴图
    public RequestWxHead()
    {
        cc.loader.load( {url: this.HeadUrl, type: 'png'} ,(err , texture ) =>
        {
            if ( err == null)
            {
                this.HeadTex = texture;
                cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_HEAD,  this.RoleID );
            }
        });
    }

    //请求微信信息回调
    private CallBackHandler( data : any )
    {
        if ( data == "-1" )
        {
            console.log( " auth account net failes " );
        }
        else
        {
            var json = JSON.parse( data );
            if(json == null || json["nickname"] == null || json["headimgurl"] == null) 
            {
                return;
            }
            let NickName = Util.FiltrationEmoji( <string>json["nickname"] );
            this.Name = NickName;

            this.HeadUrl = <string>json["headimgurl"];

            if ( json["sex"] != null )
            {
                let Sex = parseInt(json["sex"]) ;
                this.Sex = ( Sex == null || Sex <= 0 ) ? 1 : Sex;
            }
            
            // 通知事件;
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_NAME, this.RoleID );
            // 加载图片;
            if ( this.HeadUrl.length > 0 )
            {
                this.RequestWxHead();
            }
        }
    }
}

class HeadPoolModule extends Singleton
{
    private WxInfoMap = new Dictionary();

    public Init()
    {
    }
    
    //获取微信名字
    public GetWxName( UserName : string , RoleID : number )
    {
        let Info :WeChatInfo = this.WxInfoMap.GetItem( RoleID );
        if ( Info != undefined && Info.Name.length > 0 )
        {
            return Info.Name;
        }
        else
        {
            this.LoadWxInfo( UserName,RoleID );
        }
    }

    //获取微信性别
    public GetWxSex( UserName : string , RoleID : number )
    {
        let Info :WeChatInfo = this.WxInfoMap.GetItem( RoleID );
        if ( Info != undefined )
        {
            return Info.Sex;
        }
           
        else
        {
            return null;
        }
    }

    //获取微信头像
    public GetWxHead( UserName : string , RoleID : number ) : cc.Texture2D
    {
        let Info :WeChatInfo = this.WxInfoMap.GetItem( RoleID );
        if ( Info != undefined && Info.HeadUrl.length > 0 )
            if (Info.HeadTex== null)
            {
                Info.RequestWxHead();
            }else
            {
                return <cc.Texture2D>Info.HeadTex;
            }
        else
        {
            this.LoadWxInfo(  UserName,RoleID );
        }
        return null;
    }

    //加载微信信息
    private LoadWxInfo( UserName : string , RoleID : number )
    {
        let Info :WeChatInfo = this.WxInfoMap.GetItem( RoleID );
        if ( Info != undefined )
        {
            if ( Date.now() - Info.TimeOut > 5 )
            {
                Info.RequestWxInfo();
            }
            return;
        }
        else
        {
            Info = new WeChatInfo();
        }

        Info.UserName = UserName;
        Info.RoleID   = RoleID;
        Info.TimeOut  = Date.now();
        Info.RequestWxInfo();

        this.WxInfoMap.Add( RoleID, Info );
    }

}
export default HeadPoolModule.GetInstance();