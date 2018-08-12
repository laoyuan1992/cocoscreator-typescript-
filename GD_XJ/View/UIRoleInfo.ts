import GameCard from "../Module/GameCard";
import GameDefine from "../Module/GameDefine";
import ResourcesManager from "../../Framework/ResourcesManager";
import GamePlayer from "../Module/GamePlayer";
import GuanDanScenes from "../Module/GuanDanScenes";
import ChatDefines from "../Module/ChatDefines";
import AppFacade from "../../Framework/AppFacade";
import UIBase from "../../Common/UI/UIBase";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRoleInfo extends UIBase 
{
    @property(cc.Sprite)
    ImageIcon : cc.Sprite           =    null;  //头像
    @property(cc.Sprite)
    ImageIconBG : cc.Sprite         =    null;  //头像背景
    @property(cc.Node)
    HeadPosition : cc.Node          =    null;  //头像框位置
    @property(cc.Sprite)
    ImageReady : cc.Sprite          =    null;  //准备
    @property(cc.Label)
    TextName : cc.Label             =    null;  //名字
    @property(cc.Label)
    TextMoney  : cc.Label           =    null;  //金钱
    @property(cc.Node)
    OnlineObject: cc.Node           =    null;  //离线
    @property(cc.Sprite)
    ImageIM  : cc.Sprite            =    null;  
    @property(cc.Node)
    RemainCardObj: cc.Node          =    null;  
    @property(cc.Label)
    RemainCardTxt  : cc.Label       =    null;  //剩余牌
    @property(cc.Sprite)
    ImageRank  : cc.Sprite          =    null;  //名次
    @property(cc.Label)
    TextChatContent  : cc.Label     =    null;  //聊天内容
    @property(cc.Node)
    TextChatBg: cc.Node             =    null;  
    
    // 进贡相关
    @property(cc.Node)
    GiftCardObj: cc.Node            =    null;  
    @property(cc.Sprite)
    GiftCardImgNum  : cc.Sprite     =    null;
    @property(cc.Sprite)
    GiftCardImgFlower  : cc.Sprite  =    null;
    @property(cc.Sprite)
    GiftCardImgKing  : cc.Sprite    =    null;
    @property(cc.Sprite)
    GiftCardImgJinGong  : cc.Sprite =    null;
    @property(cc.Sprite)
    GiftCardImgHuanGong : cc.Sprite =    null;

    onLoad () 
    {
        this.SetGiftCardVisible( false );
    }

    onDestroy()
    {
        this.StopTimer();
    }

    private StopTimer()
    {
        if (this.ChatTimerCallBack != null)
            this.unschedule( this.ChatTimerCallBack ); 
    }

    // 设置进贡牌显示
    public SetGiftCardVisible( State : boolean)
    {
        this.GiftCardObj.active = State;
    }

    //设置进贡牌信息State true 是进贡 false 是还供
    public SetGiftCardInfo( Card : number , State : boolean )
    {
        this.GiftCardImgJinGong.node.active = State ? true : false;
        this.GiftCardImgHuanGong.node.active = State ? false : true;
        
        let Color = Card & GameDefine.MaskColor;
        let Value = Card & GameDefine.MaskValue;
        	
	    let NumImage   = GameDefine.GetCardNumImage(Color, Value);
        let SmallImage = GameDefine.GetSmallCardImage(Color, Value);
        
        if ( Color == 0x40 )
        {
            this.GiftCardImgNum.node.active = false;
            this.GiftCardImgKing.node.active = true;
            this.GiftCardImgKing.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , NumImage );
        }
        else
        {
            this.GiftCardImgNum.node.active = true;
            this.GiftCardImgKing.node.active = false;
            this.GiftCardImgNum.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , NumImage );
        }
        this.GiftCardImgFlower.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , SmallImage );
    }

    // 显示头像
    public ShowHead( ID : number )
    {
        let Player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( ID );
        if( null == Player ) return;
        let Tex :cc.Texture2D = HeadPoolModule.GetWxHead( Player.GetUserName() , Player.GetPID() );
        if( this.ImageIcon == null) return;
        if( null == Tex ) return;
        this.ImageIcon.spriteFrame = new cc.SpriteFrame(Tex);


    }

    //显示金钱
    public ShowMoney( ID : number )
    {
        let Player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( ID );
        if ( Player == null )return;
        this.TextMoney.string = Player.GetTotalScore().toString();
    }

    // 显示队伍
    public  ShowTeam( Team : number )
    {
        if ( Team == 1 ){ this.ImageIconBG.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" ,"bg_table_head_y" ); }
        else if ( Team == 2 ){ this.ImageIconBG.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" ,"bg_table_head_b" ); }
        else { cc.log( "UIRoleInfo.ShowTeam para Error!" );}
    }

    //刷新在离线状态
    public RefreshOnlineState( State : boolean )
    {
        this.OnlineObject.active = State;
    }

    //显示名字
    public ShowName( ID )
    {
        let Player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( ID );
        if ( Player == null )return;
        let Name : string = HeadPoolModule.GetWxName( Player.GetUserName() , Player.GetPID() );
        if( Name == null ) return;
        if( this.TextName == null ) return;
        this.TextName.string = Name;
    }

    //刷新准备
    public RefreshReady( State : boolean )
    {
        this.ImageReady.node.active = State;
    }

    //刷新语音动画
    public RefreshIM( State : boolean )
    {
        this.ImageIM.node.active = State;
    }

    // 刷新剩余牌数显示
    public RefreshRemainCard( Num : number )
    {
        let bShow = Num > 0 && Num <= 10;
        this.RemainCardObj.active = bShow;
        let str : string  = bShow ? Num.toString() : "";
        this.RemainCardTxt.string = str;
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

    // 刷新表情
    public RefreshFace( Type : number,PID : number )
    {
        if( Type > Object.keys(ChatDefines.UIChatConfig).length ) return;
        if( Type < 1 ) return;
         
        let Obj = ResourcesManager.LoadSpine( ChatDefines.UIChatConfig[Type].Path , this.HeadPosition , false , "play");
        //音效
        let Sex : number = 1;//需要获取性别
        let SoundMgr = AppFacade.Instance.GetSoundManager();
        SoundMgr.PlayGameSoundEffect( GameDefine.RoomType , Sex == 2 ? ChatDefines.UIChatConfig[Type].AudioWoman : ChatDefines.UIChatConfig[Type].AudioMan );
    }

     
    // 刷新文字
    public RefreshText( Content : string )
    {
        this.TextChatBg.active = true;
        this.TextChatContent.string = Content;
        this.StartTimer();
    }

    //开始文字聊天计时器
    public StartTimer()
    {
        this.ChatTimerCallBack = this.ChatTimerCallBack.bind(this);
        this.StopTimer();
        this.scheduleOnce(this.ChatTimerCallBack,5)
    }
 
    //文字聊天回调
    public ChatTimerCallBack()
    {
        this.TextChatBg.active = false;
    }

}
