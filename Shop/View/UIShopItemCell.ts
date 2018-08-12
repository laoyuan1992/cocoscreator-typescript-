import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import { ShopItem } from "../Model/ShopTable";
import ShopModule from "../Model/ShopModule";
import NetManager from "../../Common/Net/NetManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import UIManager from "../../Common/UI/UIManager";
import { UIType, UIPanelResDefine, HallResPath } from "../../Common/UI/UIDefine";
import UIShopPrompting from "./UIShopPrompting";
//-------------------------------------------------------------------------------------------------
// 商店物品
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIShopItemCell extends UIBase {

    @property(cc.Label)
    TextName: cc.Label = null;
    @property(cc.Label)
    TextPrice: cc.Label = null;
    @property(cc.Sprite)
    ImgPrize: cc.Sprite = null;
    @property(cc.Sprite)
    ImageIcon: cc.Sprite = null;

    private mItemData : ShopItem  = null;

    //刷新数据
    public RefreshData( ItemData : ShopItem )
    {
        if( ItemData == null ) return;
        this.mItemData          =ItemData;
        this.TextName.string    = ItemData.Name + "x" + ItemData.ItemCount;
        this.RefreshIcon( ItemData.IconUrl );
        let CurrencyInfo = ShopModule.GetCurrencyName(ItemData.CurrencyType);
        if( CurrencyInfo == null ) return;
        let ProtoBuf = NetManager.GetProtobuf();
        if( ItemData.CurrencyType!= ProtoBuf.TCurrencyType.TCT_RMB )
        {
            this.ImgPrize.node.active = true;
            this.ImgPrize.spriteFrame = ResourcesManager.LoadSprite( HallResPath.AltasPath + CurrencyInfo.Atlas , CurrencyInfo.Image );
            this.TextPrice.string = "   " + this.mItemData.Price;
        }
        else
        {
            this.ImgPrize.node.active = false;
            this.TextPrice.string = "" + this.mItemData.Price /100 + CurrencyInfo.name;
        }
    }

    //刷新游戏图标
    private RefreshIcon( IconUrl : string )
    {
        if( IconUrl == null || IconUrl == "" ) return;
        if( this.mItemData.IconUrl != IconUrl ) return;
        cc.loader.load( {url: IconUrl, type: 'png'} ,(err , texture ) =>
        {
            if ( err == null)
            {
                this.ImageIcon = texture;
            }
        });
    }

    //点击购买
    private OnClickBuyCell()
    {
        this.PlayButtonAudio();
        let Obj : cc.Node = UIManager.ShowUI( UIType.UI_SHOPPROMPTING );
        if( Obj == null ) return;
        let Cell : UIShopPrompting = Obj.getComponent( "UIShopPrompting" );
        if( Cell == null ) return;
        Cell.RefreshData( this.mItemData );
    }
}
