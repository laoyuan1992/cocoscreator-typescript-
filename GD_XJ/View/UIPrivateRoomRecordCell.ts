////////////////////////////////////////////////////
//                查询战绩cell                     //
////////////////////////////////////////////////////
import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import GamePlayer from "../Module/GamePlayer";
import GuanDanScenes from "../Module/GuanDanScenes";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPrivateRoomReordCell extends UIBase {

    @property(cc.Label)
    TextName: cc.Label = null;

    @property(cc.Label)
    TextScore: cc.Label = null;

    private mSelfRoleID : number = 0;

    start () {
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME , this.NotifyRefreshName , this );
    }

    public RefreshGUI( Data : GamePlayer , Color : any )
    {
        this.mSelfRoleID = Data.GetPID();
        this.node.active = true;
        this.TextName.string = "";
        this.TextScore.string = Data.GetTotalScore().toString();
        if(Data.GetTotalScore() > 0)
        {
            this.TextScore.node.color = Color[1];
        }
        else
        {
            this.TextScore.node.color = Color[2];
        }
        this.RefreshName( this.mSelfRoleID );
    }

    private RefreshName( PID : number )
    {
        if( this.mSelfRoleID != PID ) return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( PID );
        if( null == Player ) return;
        let Name = HeadPoolModule.GetWxName( Player.GetUserName() , Player.GetPID() );
        if( null == Name ) return;
        this.TextName.string = Name;
    }

    private NotifyRefreshName( Message )
    {
        let PID = Message.detail;
        if( this.mSelfRoleID != PID ) return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( PID );
        if( null == Player ) return;
        let Name = HeadPoolModule.GetWxName( Player.GetUserName() , Player.GetPID() );
        if( null == Name ) return;
        this.TextName.string = Name;
    }

    onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_NAME , this.RefreshName , this );
    }
    // update (dt) {}
}
