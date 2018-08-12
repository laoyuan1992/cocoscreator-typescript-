//-------------------------------------------------------------------------------------------------
// 创建角色模块
//-------------------------------------------------------------------------------------------------
import URLConfig        from "../../Config/URLConfig"
import HttpUtils        from "../../Common/Net/httpUtils"
import TimeHelper       from "../../Utility/TimeHelper"
import StringHelper     from "../../Utility/StringHelper"
import Singleton        from  "../../Common/Function/Singleton"
import Utility          from "../../Utility/Util"
import NetManager       from "../../Common/Net/NetManager"
import EventName from "../../Common/Event/EventName"
import LoginAuthAccountModule from "./LoginAuthAccountModule";
import Util from "../../Utility/Util";

class LoginCreateRoleModule extends Singleton 
{
    private _HttpUtils              = new HttpUtils();

    // 创建角色
    public CreateRole()
    {
        this.GuestCreateRole();
    }

    // 游客创建
    public GuestCreateRole()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let MsgCreatePlayer = new ProtoBuf.MsgCreatePlayer();
        MsgCreatePlayer.name = "游客";
        NetManager.SendMessage( EventName.NET_DO_C_CREATEROLE , MsgCreatePlayer );
    }

    // 微信创建
    public WeChatCreateRole()
    {
        let ProtoBuf = NetManager.GetProtobuf().MsgCreatePlayer();
        let MsgCreatePlayer = new ProtoBuf.MsgCreatePlayer();
        let NickName = Util.FiltrationEmoji(LoginAuthAccountModule._WeChatNickName);
        MsgCreatePlayer.name = NickName;
        NetManager.SendMessage( EventName.NET_DO_C_CREATEROLE , MsgCreatePlayer ); 
    }
}

export default LoginCreateRoleModule.GetInstance();
