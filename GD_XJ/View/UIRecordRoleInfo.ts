import GameCard from "../Module/GameCard";
import GameDefine from "../Module/GameDefine";
import ResourcesManager from "../../Framework/ResourcesManager";
import GamePlayer from "../Module/GamePlayer";
import AppFacade from "../../Framework/AppFacade";
import UIBase from "../../Common/UI/UIBase";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRecordRoleInfo extends UIBase 
{
    @property(cc.Sprite)
    ImageIcon : cc.Sprite           =    null;  //头像
    @property(cc.Sprite)
    ImageIconBG : cc.Sprite         =    null;  //头像背景
    @property(cc.Node)
    HeadPosition : cc.Node          =    null;  //头像框位置
    @property(cc.Label)
    TextName : cc.Label             =    null;  //名字
    @property(cc.Label)
    TextMoney  : cc.Label           =    null;  //金钱
    @property(cc.Sprite)
    ImageRank  : cc.Sprite          =    null;  //名次
    
    // // 进贡相关
    // @property(cc.Node)
    // GiftCardObj: cc.Node            =    null;  
    // @property(cc.Sprite)
    // GiftCardImgNum  : cc.Sprite     =    null;
    // @property(cc.Sprite)
    // GiftCardImgFlower  : cc.Sprite  =    null;
    // @property(cc.Sprite)
    // GiftCardImgKing  : cc.Sprite    =    null;
    // @property(cc.Sprite)
    // GiftCardImgJinGong  : cc.Sprite =    null;
    // @property(cc.Sprite)
    // GiftCardImgHuanGong : cc.Sprite =    null;

    onLoad () 
    {

    }

    start () 
    {
    }

    onDestroy()
    {
    }

    // 显示头像
    public ShowHead( ID : number )
    {
        let Player : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( ID );
        if( null == Player ) return;
        let Tex :cc.Texture2D = HeadPoolModule.GetWxHead( Player.GetUserName() , Player.GetPID() );
        if( this.ImageIcon == null) return;
        if( null == Tex ) return
        this.ImageIcon.spriteFrame = new cc.SpriteFrame(Tex);
    }

    //显示金钱
    public ShowMoney( ID : number )
    {
        let Player : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( ID );
        if ( Player == null )return;
        this.TextMoney.string = Player.GetTotalScore().toString();
    }

    // 显示队伍
    public ShowTeam( Team : number )
    {
        if ( Team == 1 ){ this.ImageIconBG.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" ,"bg_table_head_y" ); }
        else if ( Team == 2 ){ this.ImageIconBG.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" ,"bg_table_head_b" ); }
        else { cc.log( "UIRoleInfo.ShowTeam para Error!" );}
    }

    //显示名字
    public ShowName( ID )
    {
        let Player : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( ID );
        if ( Player == null )return;
        let Name : string = HeadPoolModule.GetWxName( Player.GetUserName() , Player.GetPID() );
        if( Name == null ) return;
        if( this.TextName == null ) return;
        this.TextName.string = Name;
    }

    //隐藏名次显示
    public HideRank()
    {
        this.ImageRank.node.active = false;
    }

    //显示名次
    public ShowRank( Idx : number )
    {
        this.ImageRank.node.active = true;
        let str : string = "";
        switch( Idx )
        {
            case  0 : str = "shangyou"; break;
            case  1 : str = "eryou";break;
            case  2 : str = "sanyou";break;
            case  3 : str = "xiayou";break;
            default:
                this.HideRank();
                 break;
        }
        if(this.ImageRank.node.active == true)
        {
            this.ImageRank.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , str );
        }
    }
}
