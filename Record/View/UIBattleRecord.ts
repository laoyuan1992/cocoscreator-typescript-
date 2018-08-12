import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import RecordModule from "../Model/RecordModule";
import LinkedList from "../../Common/DataStruct/LinkedList";
import { HallResPath, UIType } from "../../Common/UI/UIDefine";
import UIManager from "../../Common/UI/UIManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import StatisticsModule from "../../Statistics/Model/StatisticsModule";

//-------------------------------------------------------------------------------------------------
// 回放界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIBattleRecord extends UIBase
{ 
    @property(cc.Node)
    Grid :cc.Node               = null;        //cell父节点
    @property(cc.Node)
    BattleNullNode :cc.Node     = null;        //暂无战绩
    @property(cc.Label)
    TextTotalGame :cc.Label     = null;        //暂无战绩
    @property(cc.Label)
    TextWinGame :cc.Label       = null;        //暂无战绩
    @property(cc.Label)
    TextScore :cc.Label         = null;        //暂无战绩

    start () 
    {
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_RECORD_INFO           , this.RrfreshSyncRecord , this);       //刷新战绩显示
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_STATISTICS_GAME_INFO  , this.RefreshStatisticsInfo , this);   //刷新游戏数据统计显示    
        this.RefreshRecord();
        this.RefreshStatisticsInfo();
        this.RequestRecordInfo();
    }

    //请求战绩信息
    private RequestRecordInfo()
    {
        RecordModule.SendRequestRecordInfo();
    }

    //刷新战绩
    private RefreshRecord()
    {
        let InfoCount:LinkedList = RecordModule.GetRecordList();
        if ( null == InfoCount ||InfoCount.GetCount() == 0 ) return;
        let index = 1;
        InfoCount.ForEach( (item) => {
            let Path =  HallResPath.PrefabPath + "BattleRecordCell";
            let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.Grid );
            if( Obj == null ) return;
            Obj.parent = this.Grid;
            let Cell = Obj.getComponent("UIBattleRecordCell");
            Cell.ShowInfo(index);
            index++;
        } )
    }

    //刷新服务器同步的战绩
    private RrfreshSyncRecord()
    {
        this.RefreshBattleRecordNull()
        this.RefreshRecord();
    }

    //点击关闭
    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIType.UI_BATTLE_RECORD);
    }

    //刷新游戏统计信息
    private RefreshStatisticsInfo()
    {
        this.TextTotalGame.string   = StatisticsModule.GetTotalGame();
        this.TextWinGame.string     = StatisticsModule.GetWinGame();
        this.TextScore.string       = StatisticsModule.GetScore();
    }

    //刷新暂无战绩
    public RefreshBattleRecordNull()
    {
        let InfoCount:LinkedList = RecordModule.GetRecordList();
        if (null == InfoCount) return;
        this.BattleNullNode.active = InfoCount.GetCount() == 0;
    }

    onDestroy()
    {
        this.ReleaseEvent();
    }

    private ReleaseEvent()
    {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_RECORD_INFO           , this.RrfreshSyncRecord , this);       //刷新战绩显示
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_STATISTICS_GAME_INFO  , this.RefreshStatisticsInfo , this);   //刷新游戏数据统计显示    
    }

}
