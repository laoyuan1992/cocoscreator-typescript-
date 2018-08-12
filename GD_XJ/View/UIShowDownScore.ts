import GuanDanScenes from "../Module/GuanDanScenes";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";
import UIBase from "../../Common/UI/UIBase";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import Util from "../../Utility/Util";
import MessageConfig from "../../Config/MessageConfig";
import GamePlayer from "../Module/GamePlayer";
import ResourcesManager from "../../Framework/ResourcesManager";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIShowDownScore extends UIBase
{
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

    private mTimeCount  : number            = 5;    // 总时间

    onLoad () 
    {

    }

    start () 
    {
        this.StartTimer();
        this.RefreshTTZWF();
    }

    onDestroy()
    {
        this.StopTimer();
    }

    private StartTimer()
    {
        this.RefreshTime = this.RefreshTime.bind(this);
        this.scheduleOnce( this.RefreshTime, this.mTimeCount );
    }

    private RefreshTime()
    {
        this.StopTimer();
        this.OnClose();
    }

    private StopTimer()
    {
        if ( this.RefreshTime != null ) 
            this.unschedule( this.RefreshTime );
    }

    //刷新经典
    private RefreshTTZWF()
    {
        let ShowDownData = GuanDanScenes.Instance.CurrShowDownData;
        if ( null == ShowDownData ) return;
        this.ShowWinRole(ShowDownData);
        this.ShowLoseRole(ShowDownData);
    }

    //显示赢得玩家
    private ShowWinRole( ShowDownData : any )
    {
        for ( let i = 0; i < ShowDownData.win_role.length; i++ )
        {
            if ( i > this.TextMineNameList.length ) return;
            let MsgShowDownRole = ShowDownData.win_role[i];
            let NameText = this.TextMineNameList[i];
            let ScoreText = this.TextMineScoreList[i];
            let GDPlayer : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( MsgShowDownRole.role_id );
            if ( null == GDPlayer ) continue;
            this.SelectWinBackGround( GDPlayer );
            GDPlayer.SetScore(MsgShowDownRole.score);
            //添加名字
            NameText.string = this.GetPlayerName( GDPlayer );
            ScoreText.node.active = true;
            ScoreText.string = "+" + GDPlayer.GetScore();

            let Rank = GuanDanScenes.Instance.GetPlayerRank(MsgShowDownRole.role_id);
            let RankImage = GameDefine.GetRankImageName(Rank + 1);
            this.ImageMineRankList[i].node.active = true;
            this.ImageMineRankList[i].spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , RankImage );
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
            let ScoreText = this.TextOtherScoreList[i];
            let GDPlayer : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( MsgShowDownRole.role_id );
            if ( null == GDPlayer ) continue;
            this.SelectLoseBackGround( GDPlayer );
            GDPlayer.SetScore(MsgShowDownRole.score);
            //添加名字
            NameText.string = this.GetPlayerName( GDPlayer );
            ScoreText.node.active = true;
            ScoreText.string = GDPlayer.GetScore().toString();

            let Rank = GuanDanScenes.Instance.GetPlayerRank(MsgShowDownRole.role_id);
            let RankImage = GameDefine.GetRankImageName(Rank + 1);
            this.ImageOtherRankList[i].node.active = true;
            this.ImageOtherRankList[i].spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , RankImage );
        }
    }

    private SelectWinBackGround( GDPlayer : GamePlayer )
    {
        if ( GDPlayer.GetTeam() == 1 )
        {
            this.ImageMineTeamBGList[0].node.active = false;
            this.ImageMineTeamBGList[1].node.active = true;
        }
        else
        {
            this.ImageMineTeamBGList[0].node.active = false;
            this.ImageMineTeamBGList[1].node.active = true;
        }
    }

    private SelectLoseBackGround( GDPlayer : GamePlayer )
    {
        if ( GDPlayer.GetTeam() == 1 )
        {
            this.ImageOtherTeamBGList[0].node.active = false;
            this.ImageOtherTeamBGList[1].node.active = true;
        }
        else
        {
            this.ImageOtherTeamBGList[0].node.active = false;
            this.ImageOtherTeamBGList[1].node.active = true;
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
        GuanDanScenes.Instance.ClearPrivateGameData();
        GuanDanScenes.Instance.SendContinueGame();
        UIManager.DestroyUI( GameDefine.GameUIConfig.UI_SHOWDOWNSCORE.type );
    }

}
