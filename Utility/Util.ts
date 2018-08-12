import md5 = require("../Lib/md5")
import StringHelper from "./StringHelper";

export default class Util
{
    public static GetMD5( Str : any ) : string
    {
        return md5.md5Encode(Str).toLowerCase();
    }

    public static FiltrationEmoji( NickName : string ) : string
    {
        // 过滤emoji 字符
        NickName = StringHelper.FiltrationString( "[\\u4e00-\\u9fa5_a-zA-Z0-9]+", NickName );
        // 过滤&
        NickName  = StringHelper.ReplaceString( NickName , "&" , "" );
        // 过滤|
        NickName = StringHelper.ReplaceString( NickName , "|" , "" );
        // 过滤%
        NickName = StringHelper.ReplaceString( NickName , "%" , "" );
        // 过滤:
        NickName = StringHelper.ReplaceString( NickName , ":" , "" );
        // 过滤;
        NickName = StringHelper.ReplaceString( NickName , ";" , "" );
        if ( NickName.length <= 0 )
        {
            NickName = NickName + "??";
        }

        return NickName;
    }

    public static GetAppName() : string
    {
        return "ZW_ZLYDH";
    }

    public static Equal64Num( i64num1 , i64num2 ) : boolean
    {
        return (i64num1.high == i64num2.high)&&(i64num1.low == i64num2.low);
    }

    public static Num64Is0( i64num1 ) : boolean
    {
        return i64num1.high == 0 && i64num1.low == 0;
    }
}
