//-------------------------------------------------------------------------------------------------
// URL配置
//-------------------------------------------------------------------------------------------------
export default class URLConfig 
{
    private static _URLConfig: { [key: number]: any; } =
    {  
    };

    // 没有找到导出一个枚举到其他模块中用的办法，先用全局静态成员代替
    public static BindPhoneModel                = 1;      //手机绑定模块
	public static WeChatInfo                    = 2;      //微信角色信息
    public static LoginGuestAuthAccountModule   = 3;      //登录验证帐号
    public static LoginWeChatAuthAccountModule  = 4;      //登录验证帐号
	public static LoginCreateRoleModule         = 5;      //登录创建角色模块
	public static NoticeModule                  = 6;      //公告模块
	public static PaoMaDengModule               = 7;      //跑马灯模块
	public static PrivateRoomModuleList 	    = 8;      //请求房间列表
	public static ShopBuyType				    = 9;     //商店购买
	public static ShopTableType                 = 10;     //商店标签
	public static ShopItemType                  = 11;	    //商店道具
	public static SlideShowModule		 	    = 12;     //广告滚动图片
	public static QualifyingInfo		 	    = 13;     //比赛信息
	public static AgGDPayModule			        = 14;	    //亚博支付
	public static LeaderUserInfo                = 15;	    //排行榜获取玩家头像名称信息
	public static ItemStaticInfo                = 16;	    //道具静态数据
	public static SignInInfo                    = 17;	    //签到数据

    public static Init()
    {

    }

    public static GetURLConfig(UType : number) : string 
    {
        if (URLConfig._URLConfig[UType] == null)
        {
            return "";
        }
        return URLConfig._URLConfig[UType];
    }
}
