import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import GuanDanScenes from "../Module/GuanDanScenes";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIGameDistanceCell extends UIBase {

    @property(cc.Label)
    TextName: cc.Label = null;

    @property(cc.Label)
    TextDistance: cc.Label = null;

    private mSelfRoleID : number = null;

    start () {
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName ,this );
    }

    onDestroy () {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName ,this );
    }

    //刷新GUI
    public RefreshGUI( ID : number , Dis : number )
    {
        this.mSelfRoleID = ID;
        this.RefreshName( this.mSelfRoleID );
        this.RefreshDistance( Dis );
    }

    //刷新距离
    private RefreshDistance( Dis )
    {
        let Player = GuanDanScenes.Instance.GetRolePlayer( this.mSelfRoleID );
        if( null == Player ) return;
        if( null == Dis )
        {
            this.TextDistance.string = "未知";
        }
        else
        {
            this.TextDistance.string = (Dis > 1000) ? "大于1000米" : Dis + "米";
        }
    }

    //刷新名字
    private RefreshName( PID :number )
    {
        if( this.mSelfRoleID != PID ) return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( this.mSelfRoleID );
        if( null == Player ) return;
        let Name = HeadPoolModule.GetWxName( Player.GetUserName() , Player.GetPID() );
        if( null == Name ) return;
        this.TextName.string = Name;
    }

     //刷新名字
     private NotifiRefreshName( Message )
     {
         let PID = Message.detail;
        if( this.mSelfRoleID != PID ) return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( this.mSelfRoleID );
        if( null == Player ) return;
        let Name = HeadPoolModule.GetWxName( Player.GetUserName() , Player.GetPID() );
        if( null == Name ) return;
        this.TextName.string = Name;
     }

}
