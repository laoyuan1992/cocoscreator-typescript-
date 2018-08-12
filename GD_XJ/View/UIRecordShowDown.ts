import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";
import UIBase from "../../Common/UI/UIBase";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import Util from "../../Utility/Util";
import MessageConfig from "../../Config/MessageConfig";
import GamePlayer from "../Module/GamePlayer";
import ResourcesManager from "../../Framework/ResourcesManager";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRecordShowDown extends UIBase
{
    @property(cc.Label)
    TextMineTips	    : cc.Label          = null; //己方提示
    @property(cc.Label)
    TextOtherTips	    : cc.Label          = null; //他方提示
    @property(cc.Label)
    TextMineLevel	    : cc.Label          = null; //己方等级
    @property(cc.Label)
    TextOtherLevel	    : cc.Label          = null; //他方等级
    @property(cc.Sprite)
    ImageVictory	    : cc.Sprite         = null; //胜利标题
    @property(cc.Sprite)
    ImageDefeat	        : cc.Sprite         = null; //失败标题

    @property(cc.Label)
    TextMineNameList	: cc.Label[]        = []; //己方名称列表
    @property(cc.Label)
    TextOtherNameList	: cc.Label[]        = []; //他方名称列表
    @property(cc.Label)
    TextMineScoreList	: cc.Label[]        = []; //己方分数列表
    @property(cc.Label)
    TextOtherScoreList	: cc.Label[]        = []; //他方分数列表
    @property(cc.Sprite)
    ImageMineTeamBGList	: cc.Sprite []      = []; //己方队伍背景
    @property(cc.Sprite)
    ImageOtherTeamBGList: cc.Sprite []      = []; //他方队伍背景
    @property(cc.Sprite)
    ImageMineRankList	: cc.Sprite []      = []; //己方名次
    @property(cc.Sprite)
    ImageOtherRankList  : cc.Sprite []      = []; //他方名次
    @property(cc.Sprite)
    ImageMineLineList	: cc.Sprite []      = []; //己方分割线列表，奇数黄线偶数蓝线
    @property(cc.Sprite)
    ImageOtherLineList  : cc.Sprite []      = []; //他方分割线列表，奇数黄线偶数蓝线

    private mTimeCount  : number            = 5;    // 总时间

    onLoad () 
    {

    }

    start () 
    {
        this.RefreshJDWF();
    }

    onDestroy()
    {
    }

    //刷新经典
    private RefreshJDWF()
    {
        let ShowDownData = RecordGuanDanScenes.Instance.CurrShowDownData;
        if ( null == ShowDownData ) return;
        this.SetTitle(ShowDownData);
        this.ShowWinRole(ShowDownData);
        this.ShowLoseRole(ShowDownData);
    }

    //设置标题
    private SetTitle( ShowDownData : any )
    {
        let ID = PlayerDataModule.GetPID();
        for ( let i = 0; i < ShowDownData.win_role.length; i++ )
        {
            if ( Util.Equal64Num( ShowDownData.win_role[i].role_id , ID ) )
            {
                this.ImageVictory.node.active = true;
                this.ImageDefeat.node.active  = false;
                return;
            }
        }
        this.ImageVictory.node.active = false;
        this.ImageDefeat.node.active  = true;
    }

    //显示赢得玩家
    private ShowWinRole( ShowDownData : any )
    {
        for ( let i = 0; i < ShowDownData.win_role.length; i++ )
        {
            if ( i > this.TextMineNameList.length ) return;
            let MsgShowDownRole = ShowDownData.win_role[i];
            let NameText = this.TextMineNameList[i];
            let GDPlayer : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( MsgShowDownRole.role_id );
            if ( null == GDPlayer ) continue;
            this.SelectWinBackGround( GDPlayer );
            //添加名字
            NameText.string = this.GetPlayerName( GDPlayer );
            //如果过A
            if ( ShowDownData.one_game_over == 1 )
            {
                GDPlayer.SetScore( MsgShowDownRole.score );
                this.ImageMineRankList[i].node.active   = false;
                this.TextMineScoreList[i].node.active   = true;
                this.TextMineTips.node.active           = false;
                this.TextMineLevel.node.active          = true;
                //显示级别
                this.TextMineLevel.string = MessageConfig.GetMessage( 1005 );
                //显示分数
                this.TextMineScoreList[i].string = "+" + GDPlayer.GetScore();
            }
            else
            {
                this.ImageMineRankList[i].node.active   = true;
                this.TextMineScoreList[i].node.active   = false;
                this.TextMineTips.node.active           = true;
                this.TextMineLevel.node.active          = false;
                //显示排行
                let Rank = RecordGuanDanScenes.Instance.GetPlayerRank( MsgShowDownRole.role_id );
                let RankImage = GameDefine.GetRankImageName( Rank + 1 );
                this.ImageMineRankList[i].spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , RankImage );
                //显示提升等级
                this.TextMineTips.string = cc.js.formatStr ( "升%d级", RecordGuanDanScenes.Instance.CurrShowDownData.series_inc );
            }
        }
    }

    //显示输的玩家
    private ShowLoseRole( ShowDownData : any )
    {
        for ( let i = 0; i < ShowDownData.lost_role.length; i++ )
        {
            if ( i > this.TextOtherNameList.length ) return;
            let MsgShowDownRole = ShowDownData.lost_role[i];
            let NameText = this.TextOtherNameList[i];
            let GDPlayer : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( MsgShowDownRole.role_id );
            if ( null == GDPlayer ) continue;
            this.SelectLoseBackGround( GDPlayer );
            //添加名字
            NameText.string = this.GetPlayerName( GDPlayer );
            //如果过A
            if ( ShowDownData.one_game_over == 1 )
            {
                this.ImageOtherRankList[i].node.active   = false;
                this.TextOtherScoreList[i].node.active   = true;
                this.TextOtherTips.node.active           = false;
                this.TextOtherLevel.node.active          = true;
                GDPlayer.SetScore( MsgShowDownRole.score );
                GDPlayer.SetSeries( MsgShowDownRole.series );
                let Series =  MsgShowDownRole.series & GameDefine.MaskValue;
                //显示级别
                this.TextOtherLevel.string = this.JudgeLevel( GameDefine.GetShowLevel(Series) );
                //显示分数
                this.TextOtherScoreList[i].string = "+" + GDPlayer.GetScore();
            }
            else
            {
                this.ImageOtherRankList[i].node.active   = true;
                this.TextOtherScoreList[i].node.active   = false;
                this.TextOtherTips.node.active           = true;
                this.TextOtherLevel.node.active          = false;
                //显示排行
                let Rank = RecordGuanDanScenes.Instance.GetPlayerRank( MsgShowDownRole.role_id );
                let RankImage = GameDefine.GetRankImageName( Rank + 1);
                this.ImageOtherRankList[i].spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , RankImage );
                //显示失败
                this.TextOtherTips.string = MessageConfig.GetMessage( 1003 );
            }
        }
    }

    private SelectWinBackGround( GDPlayer : GamePlayer )
    {
        if ( GDPlayer.GetTeam() == 1 )
        {
            this.ImageMineTeamBGList[0].node.active = false;
            this.ImageMineTeamBGList[1].node.active = true;
            //如果过A
            if ( RecordGuanDanScenes.Instance.CurrShowDownData.one_game_over == 1 )
            {
                this.ImageMineLineList[0].node.active = false;
                this.ImageMineLineList[2].node.active = true;
            }else
            {
                this.ImageMineLineList[0].node.active = true;
                this.ImageMineLineList[2].node.active = false;
            }
        }
        else
        {
            this.ImageMineTeamBGList[0].node.active = false;
            this.ImageMineTeamBGList[1].node.active = true;
            //如果过A
            if ( RecordGuanDanScenes.Instance.CurrShowDownData.one_game_over == 1 )
            {
                this.ImageMineLineList[1].node.active = false;
                this.ImageMineLineList[3].node.active = true;
            }else
            {
                this.ImageMineLineList[1].node.active = true;
                this.ImageMineLineList[3].node.active = false;
            }
        }
    }

    private SelectLoseBackGround( GDPlayer : GamePlayer )
    {
        if ( GDPlayer.GetTeam() == 1 )
        {
            this.ImageOtherTeamBGList[0].node.active = false;
            this.ImageOtherTeamBGList[1].node.active = true;
            //如果过A
            if ( RecordGuanDanScenes.Instance.CurrShowDownData.one_game_over == 1 )
            {
                this.ImageOtherLineList[0].node.active = false;
                this.ImageOtherLineList[1].node.active = true;
            }else
            {
                this.ImageOtherLineList[0].node.active = true;
                this.ImageOtherLineList[2].node.active = false;
            }
        }
        else
        {
            this.ImageOtherTeamBGList[0].node.active = false;
            this.ImageOtherTeamBGList[1].node.active = true;
            //如果过A
            if ( RecordGuanDanScenes.Instance.CurrShowDownData.one_game_over == 1 )
            {
                this.ImageOtherLineList[1].node.active = false;
                this.ImageOtherLineList[3].node.active = true;
            }else
            {
                this.ImageOtherLineList[1].node.active = true;
                this.ImageOtherLineList[3].node.active = false;
            }
        }
    }

    private GetPlayerName( GDPlayer : GamePlayer )
    {
        let Name = HeadPoolModule.GetWxName( GDPlayer.GetUserName(), GDPlayer.GetPID() );
        return Name == null ? "" : Name;
    }

    private JudgeLevel( Num : number) : string
    {
        if ( Num == 10 ) 
            return "0";
        else if ( Num == 11 ) 
            return "j";
        else if ( Num == 12 ) 
            return "q";
        else if ( Num == 13 ) 
            return "k";
        else  
            return Num.toString().toLocaleLowerCase();
    }

    //点击关闭
    private OnClose()
    {
        
        UIManager.DestroyUI( GameDefine.GameUIConfig.UI_RECORDSHOWDOWN.type );
    }

}
