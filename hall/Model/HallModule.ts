import Singleton from "../../Common/Function/Singleton";
import EventName from "../../Common/Event/EventName";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import ItemModule from "../../Item/Model/ItemModule";
import PaoMaDengModule from "../../PaoMaDeng/Model/PaoMaDengModule";
import StatisticsModule from "../../Statistics/Model/StatisticsModule";
import PrivateRoomModule from "../../PrivateRoom/Model/PrivateRoomModule";

class HallModule extends Singleton
{
    public Init()
    {
        cc.systemEvent.on( EventName.EVENT_DO_LOAD_SCENE_COMPLETE  , this.OnLoadSceneComplete      , this );
    }

    public OnLoadSceneComplete( Param : any )
    {
        if ( Param.detail.file != "Hall" ) return;
        UIManager.ShowUI( UIType.UI_HALL );
        this.OnRefreshHallData();
    }

    //大厅资源刷新
    public OnRefreshHallData()
    {
        PaoMaDengModule.RequestPaoMaDeng();
        ItemModule.SendRefreshItem();
        StatisticsModule.SendStatisticsGameData();
        
        this.CheckInvitation();
    }

    //首次进入有游戏时检查是否受到邀请
    private CheckInvitation()
    {
        if( window["InvitaRoomNum"] == null ) return;
        let RoomNum = window["InvitaRoomNum"]
        window["InvitaRoomNum"] = null;
        console.log("CheckInvitation");
        PrivateRoomModule.SendJoinRoom( parseInt( RoomNum ) );
    }
}
export default HallModule.GetInstance();
