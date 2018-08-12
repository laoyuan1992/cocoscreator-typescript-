//-------------------------------------------------------------------------------------------------
// 商店提示界面
//-------------------------------------------------------------------------------------------------
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine"
import UIBase from "../../Common/UI/UIBase";
import { ShopItem } from "../Model/ShopTable";
import ShopModule from "../Model/ShopModule";
import NetManager from "../../Common/Net/NetManager";
import ResourcesManager from "../../Framework/ResourcesManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIShopPrompting extends UIBase 
{
    @property(cc.Button)
    BGClose: cc.Button              = null;
    @property(cc.Button)
    BtnClose: cc.Button             = null;
    @property(cc.Sprite)
    ImageIcon: cc.Sprite            = null;
    @property(cc.Label)
    TextPrice: cc.Label             = null;
    @property(cc.Label)
    TextName: cc.Label              = null;
    @property(cc.Label)
    TextDesc: cc.Label              = null;
    @property(cc.Label)
    TextNumber: cc.Label            = null;
    @property(cc.Button)
    BtnBuy: cc.Button               = null;
    @property(cc.Button)
    BtnCancel: cc.Button            = null;
    @property(cc.Sprite)
    ImgPrize: cc.Sprite             = null;

    private mItemData : ShopItem    = null;

    //刷新数据
    public RefreshData( ItemData: ShopItem )
    {
        this.mItemData          = ItemData;
        this.TextNumber.string  = "x" + ItemData.ItemCount;             //显示购买数量
        this.TextName.string    = ItemData.Name;                        //显示道具名字
        this.TextDesc.string    = ItemData.Detail;                      //显示道具描述
        this.RefreshIcon( ItemData.IconUrl );                           //显示道具图标

        //显示货币类型
        let CurrencyInfo = ShopModule.GetCurrencyName( ItemData.CurrencyType );
        if( CurrencyInfo == null ) return;
        let ProtoBuf = NetManager.GetProtobuf();
        if( ItemData.CurrencyType != ProtoBuf.TCurrencyType.TCT_RMB )
        {
            this.ImgPrize.node.active = true;
            this.ImgPrize.spriteFrame = ResourcesManager.LoadSprite( UIDefines.HallResPath.AltasPath + CurrencyInfo.Atlas , CurrencyInfo.Image );
            this.TextPrice.string     = ItemData.Price.toString();
        }
        else
        {
            this.ImgPrize.node.active = false;
            this.TextPrice.string     = ItemData.Price / 100 + CurrencyInfo.name;
        }
    }

    //显示道具图标
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

    private ClickClose()
    {
        this.PlayButtonAudio();
        // 关闭界面
        UIManager.DestroyUI(UIDefines.UIType.UI_SHOPPROMPTING);
    }

    private OnClickBuy()
    {
        this.PlayButtonAudio();
        ShopModule.SendShopBuy(this.mItemData);
    }
}
