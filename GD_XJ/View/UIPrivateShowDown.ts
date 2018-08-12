import GuanDanScenes from "../Module/GuanDanScenes";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";
import UIPrivateShowDownCell from "./UIPrivateShowDownCell";
import NetManager from "../../Common/Net/NetManager";
import RoomCostConfig from "../../Config/RoomCostConfig";
import StringHelper from "../../Utility/StringHelper";
import TimeHelper from "../../Utility/TimeHelper";
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;
@ccclass
export default class UIPrivateShowDown extends UIBase 
{
    @property(cc.Label)
    TextFangJianHao         : cc.Label = null;
    @property(cc.Label)
    TextQuanShu             : cc.Label = null;
    @property(cc.Label)
    TextGameType            : cc.Label = null;
    @property(cc.Label)
    TextTime                : cc.Label = null;
    @property(cc.Label)
    TextGameCountDesc       : cc.Label = null;

    @property(UIPrivateShowDownCell)
    ShowDownCellList       : UIPrivateShowDownCell[] = [];

    onLoad () {}

    start () 
    {
        this.RefreshGUI();
        this.RefreshGameCountDesc();
        this.RefreshRoomID();
        this.RefreshGameCount();
        this.RefreshTime();
        this.RefreshGameType();
    }

    onDestroy()
    {
    }

    private RefreshGUI()
    {
        let MinMoney = 0;
        let MaxScore = 0;
        GuanDanScenes.Instance.PlayerList.ForEach( (GDPlayer)=>
        {
            if ( GDPlayer == null ) return;
            if ( parseInt( GDPlayer.GetTotalScore()) > MaxScore )
            {
                MaxScore = parseInt( GDPlayer.GetTotalScore() );
            }
            if ( parseInt( GDPlayer.GetTotalScore()) < MinMoney )
            {
                MinMoney = parseInt( GDPlayer.GetTotalScore() );
            }
        } );

        for ( let i = 0; i < this.ShowDownCellList.length; i++ )
        {
            if ( i + 1 > GuanDanScenes.Instance.PlayerList.GetCount() ) break;
            let GDPlayer = GuanDanScenes.Instance.PlayerList.Get( i + 1 );
            let ShowDownCell = this.ShowDownCellList[i];
            if ( ShowDownCell == null ) return;
            ShowDownCell.RefreshPlayerInfo( GDPlayer , GuanDanScenes.Instance.CurrEndData );
            ShowDownCell.RefreshWinTexture( MaxScore );
            ShowDownCell.RefreshLoserTexture( MinMoney );
        }
    }

    private RefreshGameCountDesc()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( GuanDanScenes.Instance.CheckSpecial( ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF ) )
        {
            this.TextGameCountDesc.string = "局数";
        }else if( GuanDanScenes.Instance.CheckSpecial(  ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF ) )
        {
            this.TextGameCountDesc.string = "把数";
        }
    }

    private RefreshRoomID()
    {
        let RoomNumberStr : string = GuanDanScenes.Instance.CurrRoomID.toString()
        RoomNumberStr = StringHelper.PadLeft(RoomNumberStr,6,"0")
        this.TextFangJianHao.string = RoomNumberStr;
    }

    private RefreshGameCount()
    {
        let CostID = GuanDanScenes.Instance.CurCostID;
        let MyCostTab = RoomCostConfig.GetCostTable( CostID );
        if ( MyCostTab == null ) return;
        this.TextQuanShu.string = MyCostTab.game_count;
    }

    private RefreshTime()
    {
         this.TextTime.string = TimeHelper.getDateAndTimeText(Date.now()/1000);
    }

    private RefreshGameType()
    {
        this.TextGameType.string = "掼蛋";
    }

    public OnClickLeave()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.LeaveGame();
    }

    public OnClickXuanYao()
    {
        this.PlayButtonAudio();
        if( window["wx"] != undefined )
        {
            window["wx"].shareAppMessage({
                title:    "快来看呀",
              })
        }
    }


}
