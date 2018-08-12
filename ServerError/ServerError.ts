import Singleton from "../Common/Function/Singleton";
import EventName from "../Common/Event/EventName";
import NetManager from "../Common/Net/NetManager";
import MessageModule from "../Message/Model/MessageModule";
import SceneManager from "../Scene/SceneManager";
import PrivateRoomModule from "../PrivateRoom/Model/PrivateRoomModule";
import ChrysanthemumModule from "../Chrysanthemum/Model/ChrysanthemumModule";

class ServerError extends Singleton
{

    //初始化
    public Init()
    {
        cc.systemEvent.on(EventName.NET_DO_COMMON_ERROR , this.DoRevcError , this );
    }

    //错误处理
    private DoRevcError( Stream )
    {
        ChrysanthemumModule.CloseChrysanthemum();
        let ProtoBuf  = NetManager.GetProtobuf();
        let ErrorType = Stream.detail.msg.ReadInt();
        if( ErrorType == ProtoBuf.TErrorType.NOT_ENOUGH_MONEY )
        {
            console.warn("NOT_ENOUGH_MONEY");
        }
        else if( ErrorType == ProtoBuf.TErrorType.ALREADY_LIKE )
        {
            console.warn("ALREADY_LIKE");
        }
        else if( ErrorType == ProtoBuf.TErrorType.ADD_ITEM_SUCCEED )
        {
            console.warn("ADD_ITEM_SUCCEED");
        }
        else if( ErrorType == ProtoBuf.TErrorType.ADD_ITEM_FAIL )
        {
            console.warn("ADD_ITEM_FAIL");
        }
        else if( ErrorType == ProtoBuf.TErrorType.NOT_ENOUGH_ITEM )
        {
            console.warn("NOT_ENOUGH_ITEM");
            MessageModule.ShowMessage(86);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RELIEVE_ROOM_NOT_STARTGAME )
        {
            console.warn("RELIEVE_ROOM_NOT_STARTGAME");
        }
        else if( ErrorType == ProtoBuf.TErrorType.SYNC_ITEM_CRC_EQUAL )
        {
            console.warn("SYNC_ITEM_CRC_EQUAL");
        }
        else if( ErrorType == ProtoBuf.TErrorType.GET_REWARD_TIME )
        {
            console.warn("GET_REWARD_TIME");
        }
        else if( ErrorType == ProtoBuf.TErrorType.REWARD_FRIEND_FAILE )
        {
            console.warn("REWARD_FRIEND_FAILE");
        }
        else if( ErrorType == ProtoBuf.TErrorType.USER_READY_NOT_MONEY )
        {
            console.warn("USER_READY_NOT_MONEY");
        }
        else if( ErrorType == ProtoBuf.TErrorType.SYSTEM_DATED_MAIL )
        {
            console.warn("SYSTEM_DATED_MAIL");
        }
        else if( ErrorType == ProtoBuf.TErrorType.GAIN_MAIL_SYSTEM_FAILE )
        {
            console.warn("GAIN_MAIL_SYSTEM_FAILE");
        }
        else if( ErrorType == ProtoBuf.TErrorType.GAIN_MAIL_COMMON_FAILE )
        {
            console.warn("GAIN_MAIL_COMMON_FAILE");
        }
        else if( ErrorType == ProtoBuf.TErrorType.SAFE_BOX_PWD_IS_SET )
        {
            console.warn("SAFE_BOX_PWD_IS_SET");
        }
        else if( ErrorType == ProtoBuf.TErrorType.SAFE_BOX_PWD_ERROR )
        {
            console.warn("SAFE_BOX_PWD_ERROR");
        }
        else if( ErrorType == ProtoBuf.TErrorType.SAFE_BOX_PWD_SET_ERROR )
        {
            console.warn("SAFE_BOX_PWD_SET_ERROR");
        }
        else if( ErrorType == ProtoBuf.TErrorType.NEED_RELOGIN )
        {
            //强制登录
        }
        else if( ErrorType == ProtoBuf.TErrorType.CREATE_PRIVATE_ROOM_FAILE )
        {   //退出大厅
            MessageModule.ShowMessage(39);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.HAVE_PRIVATE_ROOM )
        {   //退出大厅
            MessageModule.ShowMessage(10);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.PRIVATE_ROOM_NOTEXIST )
        {   //退出大厅
            MessageModule.ShowMessage(10);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.MAHJONG_VERSION_FAILE )
        {   //退出大厅
            MessageModule.ShowMessage(11);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.ROOM_TYPE_IS_FULL )
        {   //退出大厅
            MessageModule.ShowMessage(12);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.PRIVATE_ROOM_CONSUME_FALIE )
        {   //退出大厅
            MessageModule.ShowMessage(13);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.JOIN_PRIVATE_ROOM_FAILE )
        {   //退出大厅
            MessageModule.ShowMessage(14);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.NOT_FOUND_ROOM )
        {   //退出大厅
            MessageModule.ShowMessage(15);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.ENTER_PRIVATE_ROOM_FAILE )
        {   //退出大厅
            MessageModule.ShowMessage(15);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.PRIVATE_ROOM_ITEM_FAILE )
        {   //退出大厅
            MessageModule.ShowMessage(38);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.NIUNIU_JOINROOM_FAIL )
        {   //退出大厅
            MessageModule.ShowMessage(47);
            this.LoadHall();
        }
        else if( ErrorType == ProtoBuf.TErrorType.RUNFAST_OUTCARD_FAILE )
        {
            MessageModule.ShowMessage(87);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RUNFAST_OUTCARD_NOTHEISAN )
        {
            MessageModule.ShowMessage(88);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RUNFAST_OUTCARD_TYPE_ERROR )
        {
            MessageModule.ShowMessage(89);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RUNFAST_OUTCARD_GUANBUZHU )
        {
            MessageModule.ShowMessage(90);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RF_ST_NOIDLE )
        {
            console.warn("RF_ST_NOIDLE");
        }
        else if( ErrorType == ProtoBuf.TErrorType.OUTCARD_INVALID )
        {
            MessageModule.ShowMessage(1001);
        }
        else if( ErrorType == ProtoBuf.TErrorType.GIFT_CARD_INVALID )
        {
            MessageModule.ShowMessage(1001);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RECV_GIFT_CARD_INVALID )
        {
            MessageModule.ShowMessage(1001);
        }
        else if( ErrorType == ProtoBuf.TErrorType.ALREADY_BIND )
        {
            MessageModule.ShowMessage(40);
            //绑定ID
        }
        else if( ErrorType == ProtoBuf.TErrorType.TARGET_BIND_LIST_FULL )
        {
            MessageModule.ShowMessage(41);
        }
        else if( ErrorType == ProtoBuf.TErrorType.DST_ID_ERROR )
        {
            MessageModule.ShowMessage(32);
        }
        else if( ErrorType == ProtoBuf.TErrorType.DST_STATE_ERROR )
        {
            MessageModule.ShowMessage(43);
        }
        else if( ErrorType == ProtoBuf.TErrorType.DST_PLAY_COUNT_ERROR )
        {
            MessageModule.ShowMessage(44);
        }
        else if( ErrorType == ProtoBuf.TErrorType.SELF_BIRTH_TIME_OLD )
        {
            MessageModule.ShowMessage(45);
        }
        else if( ErrorType == ProtoBuf.TErrorType.APP_NAME_DIFFERENT )
        {
            MessageModule.ShowMessage(46);
        }
        else if( ErrorType == ProtoBuf.TErrorType.NIUNIU_STARTGAME_FAIL )
        {
            MessageModule.ShowMessage(50);
        }
        else if( ErrorType == ProtoBuf.TErrorType.NOT_PROXY_ID )
        {
            MessageModule.ShowMessage(51);
        }
        else if( ErrorType == ProtoBuf.TErrorType.SHOP_BUY_ERROR )
        {
            MessageModule.ShowMessage(59);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RELIEVEROOM_FAILE_BYSTATE )
        {
            MessageModule.ShowMessage(60);
        }
        else if( ErrorType == ProtoBuf.TErrorType.DDZ_OUTCARD_TYPE_ERROR )
        {
            MessageModule.ShowMessage(87);
        }
        else if( ErrorType == ProtoBuf.TErrorType.DDZ_OUTCARD_GUANBUZHU )
        {
            MessageModule.ShowMessage(90);
        }
        else if( ErrorType == ProtoBuf.TErrorType.RECORD_NOT_EXIST )
        {
            MessageModule.ShowMessage(91);
        }
        else if( ErrorType == ProtoBuf.TErrorType.REQUEST_VC_ERROR )
        {
            MessageModule.ShowMessage(22);
        }
        else if( ErrorType == ProtoBuf.TErrorType.REQUEST_VC_ING )
        {
            MessageModule.ShowMessage(22);
        }
        else if( ErrorType == ProtoBuf.TErrorType.REQUEST_VC_SUCCEED )
        {
            MessageModule.ShowMessage(21);
        }
        else if( ErrorType == ProtoBuf.TErrorType.REQUEST_VC_SUCCEED )
        {
            MessageModule.ShowMessage(21);
        }







    }

    private LoadHall()
    {
       // SceneManager.LoadScene("Hall");
       // PrivateRoomModule.ReleaseGameModule();
    }

}
export default  ServerError.GetInstance();
