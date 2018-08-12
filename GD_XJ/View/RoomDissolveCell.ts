import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import GamePlayer from "../Module/GamePlayer";
import MessageConfig from "../../Config/MessageConfig";
import GuanDanScenes from "../Module/GuanDanScenes";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RoomDissolveCell extends UIBase {

    @property(cc.Label)
    TextName: cc.Label = null;                          //姓名
    @property(cc.Label)
    State: cc.Label = null;                             //状态

    private mSelfRoleID = 0;
    // onLoad () {}

    start () {
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_NAME , this.RefreshName , this);
    }

    onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_NAME , this.RefreshName , this);
    }

    public RefreshGUI( Data : GamePlayer , ColorTable : {} )
    {
        this.mSelfRoleID = Data.GetPID();
        this.RefreshText( Data , ColorTable );
        this.RefreshName();
    }

    //显示是否同意
    private RefreshText( Data : GamePlayer , ColorTable : {} )
    {
        if( Data.IsRelieve())
        {
            this.State.string = MessageConfig.GetMessage(1006);
            this.State.node.color = ColorTable[1];
        }
        else
        {
            this.State.string = MessageConfig.GetMessage(1007);
            this.State.node.color = ColorTable[2];
        }
    }

    public RefreshName()
    {
        let player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( this.mSelfRoleID );
        if( null == player ) return;
        let Name = HeadPoolModule.GetWxName( player.GetUserName() , player.GetPID() );
        if( null == Name) return;
        this.TextName.string = Name;
    }



    // update (dt) {}
}
