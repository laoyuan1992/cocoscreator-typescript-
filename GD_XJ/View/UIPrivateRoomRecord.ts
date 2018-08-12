////////////////////////////////////////////////////
//                查询战绩界面                     //
////////////////////////////////////////////////////
import UIBase from "../../Common/UI/UIBase";
import LinkedList from "../../Common/DataStruct/LinkedList";
import UIPrivateRoomReordCell from "./UIPrivateRoomRecordCell";
import GuanDanScenes from "../Module/GuanDanScenes";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPrivateRoomReord extends UIBase {

    @property(UIPrivateRoomReordCell)
    Cells: UIPrivateRoomReordCell[] = [];

    private mCellList : LinkedList = new LinkedList();
    private mColor     = { 1 :　cc.color(255,0,0) , 2 : cc.color(14,107,222)};

    start () {
        this.RefreshGUI();
    }

    private RefreshGUI()
    {   
        let idx = 0;
        GuanDanScenes.Instance.PlayerList.ForEach( (item) => {
            {
                
                if( null == item ) return;
                let CellGUI = this.Cells[idx].RefreshGUI( item , this.mColor );
                idx++;
            }
        } )
    }

    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_ROOMRECORD.type)
    }

    // update (dt) {}
}
