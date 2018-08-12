import UIBase from "../../Common/UI/UIBase";
import RecordModule from "../Model/RecordModule";
import StringHelper from "../../Utility/StringHelper";
import TimeHelper from "../../Utility/TimeHelper";
import { HallResPath, UIType } from "../../Common/UI/UIDefine";
import UIManager from "../../Common/UI/UIManager";
import ResourcesManager from "../../Framework/ResourcesManager";

//-------------------------------------------------------------------------------------------------
// 回放详情界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIBattleRecordDetailed extends UIBase
{
    @property(cc.Label)
    TextRoomID :cc.Label                = null;             //房间号
    @property(cc.Label)
    TextTime :cc.Label                  = null;             //时间
    @property(cc.Node)
    Grid :cc.Node                       = null;             //cell父物体

    start()
    {
        this.RefreshGUI();
    }

    //刷新界面
    private RefreshGUI()
    {
        let RecordDetailed = RecordModule.GetRecordDetailed();
        let RecordData     = RecordModule.GetCurrRecord();
        if( null == RecordData ) return;
        let RoomID = RecordData.room_id ;
        if(RoomID)
        {
            this.TextRoomID.string = StringHelper.PadLeft( RoomID , 6 , "0");
        }
        let RoomType = RecordModule.LookRecordData.RoomType;
        this.TextTime.string = TimeHelper.getDateAndTimeText(RecordData.time);
        //填充玩家分数
        for(let i = 0 ; i < RecordDetailed.score_count.length ; i++)
        {
            let Path =  HallResPath.PrefabPath + "BattleRecordDetailedCell";
            let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.Grid );
            if( Obj == null ) return;
            let Cell = Obj.getComponent("UIBattleRecordDetailedCell"); 
            Cell.RefreshRoomData(i+1, RoomType,RecordDetailed.score_count.length);
            // Cell.RefreshName( RecordDetailed.name_count[i] );
            // Cell.RefreshScore(  RecordDetailed.score_count[i] , i  );
            Cell.RefreshPlayers(RecordDetailed , i );
        }
    }

    //点击了关闭按钮
    private OnClckCloseBtn()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIType.UI_BATTLE_DETAILED);
    }

    //点击了返回按钮
    private OnClickBackBtn()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIType.UI_BATTLE_DETAILED);
        UIManager.ShowUI(UIType.UI_BATTLE_RECORD)
    }
}