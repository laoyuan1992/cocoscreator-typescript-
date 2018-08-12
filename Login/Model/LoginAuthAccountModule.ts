//-------------------------------------------------------------------------------------------------
// 账号验证模块
//-------------------------------------------------------------------------------------------------
import URLConfig from "../../Config/URLConfig"
import HttpUtils from "../../Common/Net/httpUtils"
import TimeHelper from "../../Utility/TimeHelper"
import StringHelper from "../../Utility/StringHelper"
import Singleton  from "../../Common/Function/Singleton"
import Utility    from "../../Utility/Util"
import NetManager from "../../Common/Net/NetManager"
import LoginModule from "./LoginModule";
import Util from "../../Utility/Util";
const BTNAUTHW : number = 298;
const BTNAUTHH : number = 90;

class LoginAuthAccountModule extends Singleton 
{
    private _Authkind       : number    = 0;
    private _Host           : string    = "";
    private _AccountID      : number    = 0;
    private _ClientHost     : string    = "";
    private _ClientToken    : string    = "";
    private _ConnectHost    : string    = "";
    private _WeChatOpenID   : string    = "";
    private _WeChatNickName : string    = "";

    private _HttpUtils              = new HttpUtils();

    // 获取账号ID
    public GetAccountID()       : number { return this._AccountID;   }
    // 获取客户端HOST;
    public GetClientHost()      : string { return this._ClientHost;  }
    // 获取客户端登录TOKEN;
    public GetClientToken()     : string { return this._ClientToken; }
    // 获取微信OPENID;
    public GetWeChatOpenID()    : string { return this._WeChatOpenID; }
    // 获取微信用户名字;
    public GetWeChatNickName()  : string { return this._WeChatNickName; }
    //获取连接Host
    public GetConnectHost()     : string { return this._ConnectHost; }

    public AuthAccount()
    {
        // 游客登录;
        if ( cc.sys.isNative || window['wx'] == undefined )
        {
            this.GuestAuthAccount();
        }
        else
        {
            this.CheckWeChatAuthorization();
        }
    }

    // 检查微信是否授权
    public CheckWeChatAuthorization()
    {
        window['wx'].getSetting(
        {
            success: (res) => {
                var  authSetting = res.authSetting
                if ( authSetting['scope.userInfo'] === true ) {
                    // 用户已授权，登录游戏
                    this.WeChatAuthAccount();
                } 
                else {
                    //用户未授权，显示授权按钮
                    this.ShowWeChatAuthorizeBtn();
                }
            }
        });
    }

    //显示授权按钮
    private ShowWeChatAuthorizeBtn()
    {
        let SceneW = 0;
        let SceneH = 0;
        //获取设备宽高，按钮自适应用
        window['wx'].getSystemInfo(
        {
            success:function( res )
            {
                SceneW = res.screenWidth;
                SceneH = res.screenHeight;
            }
        })
        //创建微信授权按钮

        let button = window['wx'].createUserInfoButton(
        {
            type: 'image',
            image: 'https://wegame.webtest.zhiwa-game.com/wechat-game-res/GuanDan/Texture/btn_g.png',
            style:
            {
                left:  SceneW / 2 - BTNAUTHW / 1280 *SceneW / 2,
                top: SceneH - BTNAUTHH / 720 * SceneH * 2,
                width:  BTNAUTHW / 1280 * SceneW,
                height: BTNAUTHH / 720  * SceneH,
            }
        })
        //授权按钮回调
        button.onTap((res) => 
        {
            if(res.errMsg == 'getUserInfo:ok') {
                //隐藏授权按钮
                button.hide();
                //同意授权，登录游戏
                this.WeChatAuthAccount();
            }
            else {
                //未同意授权，留在授权界面
            }
        })
    }

    // 微信登录
    public WeChatAuthAccount() 
    {
       
    }

    // 游客登录
    public GuestAuthAccount()
    {
        
    }

    // 回调结果
    private AuthHandlerResult( data : any )
    {

    }

    // 验证账号成功;
    private AuthAccountSucceed( json : any )
    {

    }
}
export default LoginAuthAccountModule.GetInstance();
