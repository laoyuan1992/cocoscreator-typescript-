import UIBase from "../../Common/UI/UIBase";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import Util from "../../Utility/Util";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import EventName from "../../Common/Event/EventName";

//-------------------------------------------------------------------------------------------------
// 回放人物信息界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIRecordPeopleInfo extends UIBase
{
    @property(cc.Label)
    TextName :cc.Label        = null; 
    @property(cc.RichText)
    TextScore :cc.RichText        = null;
    
    private mUserName : string  = "";
    private mPID : number       = null;

    onLoad()
    {
        this.RestData();
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName ,this );
    }

    private RestData()
    {
        this.TextName.string = "";
        this.TextScore.string = "";
    }

    //显示
    public RefreshGUI( UserName , PID ,Score )
    {
        this.mUserName = UserName;
        this.mPID = PID;
        this.RefreshName( PID );
        if ( Score < 0 )
        {
            this.TextScore.string = "<color=#B2252D>"+Score+"</c>";
        }
        else if ( Score == 0 )
        {
            this.TextScore.string = "<color=#330A00>"+Score+"</c>";
        }
        else
        {
            this.TextScore.string = "<color=#330A00>"+"+"+Score+"</c>";
        }
    }

    //微信名字
    public RefreshName( PID : number)
    { 
        if( !Util.Equal64Num( this.mPID , PID ) ) return;
        let WxName = HeadPoolModule.GetWxName( this.mUserName , this.mPID);
        if( WxName == null ) return;
        if( this.TextName == null ) return;
        this.TextName.string = WxName;
    }

    // 微信名字回调
    public NotifiRefreshName( Message )
    {   
        let PID = Message.detail;
        if( !Util.Equal64Num( this.mPID , PID ) ) return;
        let WxName = HeadPoolModule.GetWxName( this.mUserName , this.mPID);
        if( WxName == null ) return;
        if( this.TextName == null ) return;
        this.TextName.string = WxName;
    }
}