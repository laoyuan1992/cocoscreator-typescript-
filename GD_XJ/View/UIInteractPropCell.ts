import UIBase from "../../Common/UI/UIBase";
import ItemPrototype from "../../Config/ItemPrototype";
import GameDefine from "../Module/GameDefine";
import NetManager from "../../Common/Net/NetManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import * as UIDefine from "../../Common/UI/UIDefine"
import ItemModule from "../../Item/Model/ItemModule";
import GameItemInteract from "../Module/GameItemInteract";
import UIManager from "../../Common/UI/UIManager";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
//-------------------------------------------------------------------------------------------------
// 游戏道具Cell
//-------------------------------------------------------------------------------------------------

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIInteractPropCell extends UIBase {

    private mItemID :number = null;

    @property(cc.Label)
    TextName: cc.Label = null;

    @property(cc.Sprite)
    Image: cc.Sprite = null;

    public RefreshGUI( ItemID )
    {
        this.mItemID = ItemID;
        let ItemData = ItemPrototype.GetRowData( ItemID );
        if( ItemData == null ) return;
        let ProtoBuf = NetManager.GetProtobuf();
        this.Image.spriteFrame = ResourcesManager.LoadSprite( UIDefine.HallResPath.AltasPath + ItemData[ProtoBuf.TAttribType.ATLAS_FOR_ICON_STRING] , ItemData[ProtoBuf.TAttribType.ICON_STRING] );
        if(ItemData[ProtoBuf.TAttribType.SELL_ITEM_BOOL])
        {
            this.TextName.string = "免费";
        }
        else
        {
            this.TextName.string = ItemModule.GetItemCount(ItemID);
        }
    }

    private OnClickInteractProp()
    {
        this.PlayButtonAudio();
        if( !GameItemInteract.WaitClickGift() ) return;
        UIManager.DestroyUI( GameDefine.GameUIConfig.UI_GAMEPLAYERINFO.type );
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgUseItem();
        msg.template_id = this.mItemID;
        msg.item_count  = 1;
        msg.use_target.push( PlayerDataModule.GetLookID() );
        ItemModule.SendUseItem( msg );
    }

    private 

}
