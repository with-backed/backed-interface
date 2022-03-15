import mjml2html from 'mjml';
import { EmailComponents } from './formatter';

// todo(adamgobes); actually style these email tags to make them look good rather than just plain text
export function generateHTMLForEmail(components: EmailComponents): string {
  const reusableTextStyles = `font-size="14px" color="black" font-family="maru" align="left"`;
  const reusableAnchorStyles = `style="color: #0000EE; text-decoration:none"`;

  return mjml2html(
    `
      <mjml>
      <mj-head>
        <mj-style>
        @font-face {
          font-family: "maru";
          font-weight: normal;
          font-style: normal;
          src: url(data:font/woff;charset=utf-8;base64,d09GMk9UVE8AACSAAAoAAAAANbwAACQ1AAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAADdRTG1AGYACEWAE2AiQDh1wEBgWGVAcgGwo1NcyzOMbtzNxpNxxGABsHAWW2Zf//t+SGDMEVoLf6ieAqN1bZ1/m66ei3ZIgfJ6WwkB83mhrdFtpQJfLyoI8k0sAsXvYbdKXKELK0cIQhnewXTDhBhxNqSlLZZXRdo8X/+33l6hnMWW6jV0e6dGqdD6Xk/4l72rnv7+62BZQ0GQUUaAiJB7kEQe0PtM1/R5oLbUQ9ExOxEaPBAjsxEtFesShd5N9cuCqr/mbGOlznoRjTv5vfr2hmv7rDSk7nnGdqFSSIRiDYxRKkl4oK5oEAFWhJeeI2/157EgSb5qx7htVjSoU+Pk9N78Kv+JUImZNtGvHvbXbT7D+BkOWgZZWfn9PkhF8BfXL0/xLrDggFQneBb6t7AdDJIsO0mhb+KVxp2ZtpKTXKqercNU7VjmpkwHUIaNGIawfXQQDjGjjE9Lr1pTkM3MwQ0uPTflYsACBoJ+g/J1GUdFF3QVFI4XSjgW08teWBQYH/336/r2+PYBJZfUq/QmiEYo2QTM4dXKKoDKKJEKGRaY+Lf/XQdXXxkJv9r63W/pxYdYhISdXT09SbnCanGTR3uGXRTIW9nrLcj89i87c6sQx650Gs6DvooANsTT8yLNIcOtifsdn/p5sXyYpF8U1kDEExsBfXJ6dB+6HVSA8eLkHTpRf/oAR8eIcuMSh5pgBncSf4nL08P4+f96lQfHI98akmd/o/Tq0s2btB6bt3uVdyMqlsoZp5Yv2Zty5N7ITlJ5MNXdXUA1UDBEggB4oodNCYY/LggydMjDQ5hMqtV2Wfg065oFW7bkMm3PXES+9984vYQkREClmCaKSbedY55NbH+lxExsjYPAWLNt+eaqrtdBdrr7fhbnSvJ73tc7+aGeBIODmc6nRGm/ms5zDPfWp9U84823zjN7Ytq9ruHVztLqxpnRvaxG7s/h5vep/3c+JJxJqbskVJVjXTZwxQ0iHZeURNWrBq26E80akvuei6h170ZXDrHUeSmLOx4gyzHtgUT2Dip14y77zgf35al1uYZMwjkdo0+WVc5IWPYC1K7J7PoFM9xB4N6p2U9Fy9XmSiR4MvYxDNrCR0clqpDPweGo5Bh240+igZvTeOzkaRiVH6RpG4wLOGauOCa36Rc1zWuYiArs5ZrgbV6j1x1/ZtrsskDjRNGFK8fh10HRhCGcC7W84J1lBv3B+f5N5iQcxwfwFtldPWgxjGw2dlo0KqyB5Z2R7Fo/co0KBHJXGP10XP9I1nur/0XBAqBgrPTmGGr0R6PaI3zyVv0iKIqQLwnAdxCCD7TZY7w9IoseGoOE+FajlyDEWBArlzdLFVh9JScmqkP4pCEJHQ6/xBY6XaVOItmv9OEYVBCrJ8+SancXjOXD5ZYOpDVD8tUdQd1kDubV54i/d0ORcim0EGxxDejtYoqpGdZEsiicQST3xumYfM+dyy5Eu+Cl2lDp+cVI5Mc5L76VLJldF87NiPXVM5acuMl+ahjKpV7/M6DGKnQHJkMmbjTQcTSxx1hsXR4MGUxcpM28y0yvCpnKs2L356AN1nuATZAuqCKshW0ACpChpDtgXNkB0HtED2BK0h+0A7ZH9wCHLgDB2Qo6AzpBb8Dzl2g22QC4PLkDpwBVIPuoMdoBfSEGyHNIE+SPMB/ZD2CwRdOgDp3npwSM8DjCwdBaNLx4IxmCjg8QzjkEkwEdgFUzC172rweUCuB9chNw+4Abkb3Ay5D25DHlzhDuQFOFO/G9CR6SfYA/lywAPID/AQ8hM8Cq4FnsCv1moO7wR7gT9bP4X8PeDZ4ZkLnGTpczggvxgOkYJXcDIAr+FkEXgDJw8wg6WwxF1+QxQGCEyf9fHW+wry5CtQqjOd60KXqq9xSlOZ2igTGQazYZuMg++ne26/5foNUlBR0zIwI9GsWA4u93j5cYLChkwBNmLMhCkz5ozC/+AlK9Zs2LJjz4EjcUlp2dJ6giBDkCMsISxTUFJRo1C1UF19QyMTM3qoXElodAaThWJsdqfb4wvwocj94dHxyenZ+cXl1fXN7d39w1gilTm5XpxBtIw70G77HRYrUeq377Djzg898tgTT6Gg2mPDlh17DhxJSMvKKyoT1NQ1nTjTdkHSNWjYqHGTrrruptvuuu+hx556btorbzjvnVg6BiYWFIaNnZObh08ALyTivmGjxk2a1nTiTNsFSdegYaPGTbrquptuu+u+hx576rlpr7zxzgeffPHND7/88Y/YrDkLQWs005e77f6x/NcPdvxun8+cv16W/A9vw58Sd+OEivAseY8SnercQLwp8BoU2E+d/9EyTH6CCDO1q7Gn4UJTn3lraPkJ649uH+HJd/twMz4xuwmf/s9sfqoO6t/KStZXJvdWbG0TxJ5hfzAaZUbR0GUesc0+wTNMT0MxfxYRE2z+iPBwPWOFMx6DIchGQR13VMWfC+fsHg94wbG7Erk5ROy5qistBddkM1gEMdMGK1R8LuYf4dPY1O3qpFvDCbDPqTtUdvexWMrlvN/H5x53qcf8nsNj6t/wOKahGmO7fAu85nofUgnwakTKhwj7N7a6r8sLaCQEJtux2hQZmazRtg4bvOY54TFsZot4GKqunqcHrYkWOUqkESr+jZhn+aL4HnbV5TsICf/DWvqi9x87OM3Bo1U2WhxGMTcP+cNBOlIdvrNC0pgOVxihuvRGEV+XiF8T51sqYsJOEHd49bCvrdY9lWIoUaHuEn1hN1Zcn4LYDr4YjjAcii3gBVB8fX0FV6KyR7ZuXvOLMjsR0lRUmj1as+qvaE/f2/p5G6LJV5rGibDVbe6eEBtfEkn5kf33mKUf/4yNff8soenik176T+btzNTqp8A+ofqXCfTvQQvDPBYJxgzoIRiTkVieTqgu7Wqep0bSfApJDqr5SipPwya1eSxYDmn+9U9aEKRoBPW5+znQCPYDkyDjaax4yNi6Mlhv7it27TnB2BiT1rvuS3oRAm03E5d+hHtf7RSkvs4wgyP0sb6019zWlX+p5UmzT58t++S5vn/Up84lKbcSr9i/EtvBV6WICjPrtURh7pmImXsl5XHrwjXWtBm0x1BEdIVfHkXOORHXDOiaWP9Si+2TKj0usQybE8vdQnXtosZZciIeSaA83b13a8yfmVuOr6Xi+NKUhoK5F7Z5YO6SX8k93BXzeKF73wra4yx6/xq3H0AuLX+e5129M6cUTPA+fMwey2WlsCekoXN1Q849HzLTmvJDFRCz4IahKEKXzLqGQjW9zTUL3BEWucKuzVfdt0ABNIO4ssAvG/cLvZPv8WS4SZBPXDtrHZZYAwdGqodUfLjyAWhvLcGYIpZAJKn/EK6N26McpEg5LD6F2jJQZOUquB9k4o6GazbaynJgZ62w6j+GYhaNGazZrmZU6jXyoI8BHxi3z+/YIf4fB/MVnvZEBGZ1lykeIHV4FKjcudqs0nF7wRhUaV/JKnfrV39kgnRYYuHmc+DY3pl93TJ6EbImZv1VeNzVKztp781q26QuKFyTXtMQNK2EtseVfQjbDbpzXqtdwj/Idr+E8iUa+xOzZpfPUd3DKhUYEEjHToApC9XYwjqaIKFITkU9toA3BhfXsG7DsCUHiybxWXglj+tRn1xQu0Re4kaFq5oq7RZdIVAet/yxf58+jxn8vK50Yx2edSoxngC9lwqNgqdgjaH5nJfdLcHXeNOlZrVMseko7g07E2w6rWjrIHoLSdDuobsitoEPhoCNfbE504dm4XJ2WQ8GMPg8D9zSfpyURwrVpfW1DnJvQ0aGwxJb0lvOYLRdoDl+0vvC1YZvdyhDV2pX3ravzqnp9Cytgo2YsKOTPmuVahJ0TaF9Su5bpAnxrwGRlFPPJ8LO/8nTSHPc1xw6C4jK9dBFn8LYFCh4mAqsYftM3MSCZX9OypV8qLoqmRXizWknr+HX1GpGCSmFhIpfoW4lypuyq6lPAq3R15ZglD6YqLyE+tepFNXXHvoCFj2+v0oN9liQWLc/IkBfgSpXhYgHSZDan5UoF0pNGrvAHA7QxbrS3vKGsgep5sZiG35LvNzTvXQOOdvM0Ow7tni4jq9KKBoYB0+GYW7eUJOQqZmWSkeMAWMjHcTYErce8QkNhNvSUPxRi22xKTIm+viZ2bYSfcfIHjy1LeQQHxyNDznNZLQmR3JgaYfYOpxIheMol3JsJ+UczdHjq/EkvjRJ1Lv8Q6wbilZqpXZUU5fP7TnA2GhK71/hjjjkSDkrD8YxJxVOchw+ej+VrBeYcEd/FKGLZ7ykP4RakHeGXBCkDflknTnwIiifxOkPQUW1HD8eS6xVmIf9J65i34wG/lin2bQoMZFsUJ1V5sr7of1qLtiKA+ZUpBka/p9Z0cJ8Zo+KO1ocD2Sz5wh5DNmpt/1D8GYBv+UD9p/kbtaM7E/uXWK6lHd5/oj7aaj7xktsDc56yUNW0xD09AxiyhYnJ4Ul3YXwDWD0wRyOPwKHN3jbJeGYzXIZ2V1B3kt0ApKLHWouHZLiYYC0lUzufisolfRc7enpcXcYlimm9nW/RFVVKOBRxYelhz8YndrPtz54+dt3fOqoJ9K+ftXqwgo4m+NwfNj/xLTtwYgDn9HAn8O4uvTBCD5Ke8nze2QfvjT17Jn/pck7HLDkndu/fOBTGYsbYDexLosqMe0aqv5IsHZvtXvCXFOg4hVti6WViibTlXEesZNyub/TVgR5kTwz34R9J4dWl9pSWOs7rM1Ra54qgUS+p7mMX1d1ZDSIZz2s1VBcLiUFWuuBk7Qjc0fBvBNDKFO8FewSU32z5UF3KTaeEllTI4mT8hnSMxlGn8LrcvjhGFaUxWAFTnxizEbPPT0+tpPqkh5Ob0F4SzTiJAm74mlVdaUvEM2/Tbdsjl2aMDNyfQK8Eif6ZvZBb2NFkugqgYq7wTUY+fcXTKCxPvaHEaigSnUzh8XHTY8lEHsbaWxSH73A9u6dm4/oZL7qKedbe5CAhVcmAGk1MlCXvAxls8WmuiOdNJcXSwbSVnbzNsszfijiPPJ0b9B02rg2zXYQUfL+3TKmKSGUdvYpELo+34Sc0Gmacye3Czn86Yndn4HFTNARyxBEw3qJvHMwl56rGkHB8D0/Ptpt74qHOlbqgP3QB8pPvjLScmUrXKpfoXO47K2w79CgLZUdHCh96HQASfFXeIdehdf0IODrZThkznOVTBWX0mxuj2xFk9iVtOMZrm4QWhdWQYXk6R8HTyft+4LF7mWcsBA1ZEylPuRx4mO7rF8SPkXtQZtBncNCzbVX3ZA3MfMmoZDbengdbJjC7czllsqM18TLE1YSRz/diiRUV7REhJmzXp32iq2NeCFY1VCROoyKfRVuQVu0s38KtfYfNhevm/EP4fsYxm+4y7sJEa568K7xXxqkoRLUZ7JCZSoNJSlCih9B7pCPFXFHVtCVwqhUhc8XTEi4j4i1J6XXuPmp7DwXJr1w+mBNiEJI8fnw7N8z9yWmV1kLulUr8n/5rmRrJTN8RDEZjNGnbFLUq3CZ7sborim/GIs9BWj+G7/jW/U5rYmoABY3Fi9OXC2qhr7cSkZrVXuv/TlnNvKpyRiCUkI2BkKVrDQZSV8F6Kw+uqQXR9NrpJPoU/rQVX5ldjt6ZC/c2/xWGXqJj0Q6lqM7i/Xr6mJ5AV+dLvTBRn8wMp5REVWrhDKdYE4x1xE/Z3Zwz/rnps24wvgRB9iGlhEdXDd0l4NVHxgEiAbPOxOIaQH2T+sK9hQR7uyCPQgjOS+vr1JC631NCug3I1I25rqmG8oUiSLpfykFaOOE/VOy86jhvM8hdrN2sUbuPKvny5x3FW+M/sVOZQXG/eQtOzH6q1glsvgH26Zuf15wY13FEK3vSCQBrU1lKJpUtxZf6afnC2iXeoZDL0zlKDvF1PN8PgcZArSB3SoL3MoK98/tqmxWakYfUXYzNKY+spUS6AHhmL4L+l6qX0bXiwqk2W/Zk1nigfzAjhWMT3KojXmdSKOtvsSojZg1TWZKCSUNI/QpqFuHzUFfukpXsgyFqiS1f0tmyACU5DTOa7udfuhq8pLC/GM6+dDj9Vr7/49q5CrVchFmW8HclyXdKrcB5n79U/+lWo8rJdEl5bV2vYTBDZlRd3lwzCb1t/6nGCpMJVDpVEYr1+G2M901721eSNhzwNMyy3KMdbL1J9ts26/2CfY3HP0dAY6jHM86hztXOV9BAhpMYY1O2dRrp+xL3rGcsreGd4T3yd6Z/EifGT4wjyvf6q1S/ctvpaZnZytfz3//wWGgwE6UFZKUEelyg2d8Rmx3GkwWu8s+NVK6DTrqnOsemFE4sLqtX2a+la2IC8lGFjj661hNh92bi9n8VZg9mLBzYrE4j+yl3hLJuFTvIQsPz8LDLsX6s7/VrgSKQPmbUIN4y5k6uKBvofBG3Z44sh0VdaRGb5RFtYfnqQgmg/x0aA9KBKLKVKWKlDzA2rrrC1eliwSM+WhjdYSXGHXb4sD1cS1J0z/sORms52vqB8N18R7Fp7GiPtQOachZhaiYBs7sqPv6cF2CZ1BBdjdg8DFfydB6ntdjgVnPagRGE+aPd8lvOFp2EtIQnIi0n+K547BLBNjxsD/jKvbiaCxaJD7iLaXX2rAz87nKp67yLP4IxNWFWBO2uaWCve7bhYSp3VveB4/i6o6RezLaEWPcUtRcpgiwP1uI2YdJubhQtrJZ7KDxsjz7PQuNqM7APKlTlU4Oj3o4EXlf2GlQHWhy6yvI+08VTbhnE1by27pljJICk8OcFudzjl2CtGGdVYzHJLCQTJrRRvkDQsmBsDXrvF6f1pTk62Dtw40vvmETjBhLn2+R8gqJY003lCYLbddObDdmTReiuv1RNGb/5cmgWSaS34ojtLPf57htW3+8zHPoAB2JZvnrXhfh23lyl7+wDcdRagmLmvuvmDRhGwnwUmU+K/yd3CIIBXJwkxygNU8g5T/6qKzudnjyM8qv4J8lLoaQ2kIu4djDTaMAll4snraVP566UvuZzQULmFPTgAIkr2g5sGwgOyYhcmc8ik7P06XjmoUIDlaIzCX3zD2X+qpIpsyAUWl2nelE/pUQOQLAaiQ51OKVQI4bVj7QOGw+xgAk3Tvg+dtI8xq+qLe7wkoPFGf3u+UtzOz94rCaF0jgI/vxhdRPrzdla2OOF8Dypqb0ndgfERcl6ADZvqPomhb94xM5N+exX+Msorj4WO74lvxqZjQ3dF/+9pX28p72b47jKzJKJhMXNjoGjpBSWunYq8TEhSok8NitwgjSrkOfTMc1J8MNsKS+3Ppy2ON1J+XnO0h7jcSlpmlt1Ca9QwLJTKexFwjB3/vhX6K+50edV/+izOpDD43jZq99detXtFfXfPWptoGx7esSPfJBugAMotEVFpCdMx+GpxTlYI/Q/neliTTDcIPMsCXbZr/YumnGBPeSs0zKiyrbG7/0aaD5ZJ1gayN/P1heX2m1bRUt0ouk3Ehatj0L9XEP6Dv3TtGjuqWCfejrr3ejECblkyTG/gY/jSVMDCPcli+JeCatWxZJajHnDMb/YsOcE7p94OMiGcxE6Ti78zhtjLt1Is9RbZU3hEIkRpcC/Y6LUn0P7D/YZ5wg5XcSxTiacf15xWeNozijTf5rGy9mHEd/fzL3nNhOpvAF2RWaC4yGOCjpIdYuz9feI8HXgv4U6Yhcpa38TR52evrQqh8X7Wtyfe5D+IFt8g4Nmc6R7SeEfORVzWLjvAXX6rrK5eoz97e+2A4vqtmd2wP8ClB6aeykEZJt43JlD+j9Ku1f8NyvqIraX09gYv+7o9S6dcg8xF7MgR+hVo/X9d6QFN/zbGJMguaJa7mw3lz+jddHEDy/D26xz2xc1SP/rvZO71ffHUXEZXijePPK5OLeBr40q2xinBw5CRVTzGu8f2CsMbAt+/wj4IA0Q18UKbm47ZOkGC82Cze4YjQYn2ozjC6Fl3kqrJFn2N3S+Zmf5Ndw/B0PL3cQ/ybIBPhp/Ep+TbeMH5zMEefxdmxXP8p3B6Ni2QGiSbeRcw4k5866M5ajVtV0Un6s4QUv8ceej8JhSQvT3knHtWaGy2BxS6n72pPIu15OP9xIamvlUMtJqtVkzsv9yS0nnGzqO7S29WqqYZnF1P6989y1vwdTfLMBfBsDpl/p+MK72psvTP6sSQnOPmTi5bWL8S18FV/UWuxuahrKL5GH4pISJ76+g/jaAm3/kC98bBSdaInIJZR7ifM3szkSjI6niJFFbilI45dWghlcNrH4thZLamEm5au6glH2vERMllR13g3chRsf1fIj1n3qtbW2sMxXo+RdFcENDkxItWoNQv+ZFY0/daP8gYbfNz8w9ifShWXR5sazK6kY3psm6PSegMIP9aFYk0v5Daa3zJPVg84EVsOvcXv2/pNx9m0Fa3zE+/AqZWi3ihJyiwZuaS+uywoCviinaPJ4oyEnnLT4E4631KS/2Rcop+6ZKwpXNg/l1FMV9ZkihMHanguqpBkFlFBXws74oZqyOn4l/xGoCE/pUlivGHx6MoElSImVprr9RbjJW8LWPWT3dEv9i8K1hm6/DzM3HFqPx/FltWcBo89j88E8MP9pKe6nmSfwJi2gLY7UhdcDOyHUYHXKixsffepOFWWkEXPD49DoC9rjKIWiQV0ix42TELR6yK6IqyE2n5u8WIK7fgnbHRjiDisTrjch3K7EhneqiDdyP7Sbe0l5mzm6KhuqgpUd4ll8Mh7MIU25aEPwyitN6OQ2c0ApeGlPPV95AGaPlmLf9+2rBtt3wClT1BHcEGbISrih7JjGVUa2CPOssh724G5f5+MJqlGdWOQuhuRhhhHloB8dOf9b4uiW3FAZLG0tSdWhki2PPtpO+NfZs6Yg0XeRwi6pnfebvDaphyCkzA10r73ZUR/Lag2FST9NBODv4wkqca6vQwNsnjO54pwdSyJ6NZ/maBBe2R5HiShl65Hv8K2GIgyG7MJaJbqu27JWoXbJlYp5ZXfxasIgKa82I+qbxQcr26pSJxzUmTcG/lo2Ze6r2y3n8TVpIgEb/kFXLK1SNekL5E8FxbXGhDkuI8Ba8Q43JfG31sYfxyYhM9tZoruv/xAsa6q0RgMnRocKr8An+lpz35nNdAFflimoYXErGJ1k0+mqthbyFsF8ZLHXdKdHWA/e2cOew7jsr9Npj0SkIqj0Jb1mUleiTGAGx+cMtRVfOWPTrcJE4xUoX6b21OFtGnU+8nYUJkatsTef0NCxoBC1baT9xqjb/F4JTWpXvvGtprceEUOgeA1MLEio2+WYkN6+VgUSWAn97U8Qc6BNDCIlZWewxYHjffxnTkr4Fv999rik/FN5JsZ9rpFFfpJdhx03F/Zi+e8qzsZIb7lMv5qd24cSvVq5FLvaU8OucdlEmrFFvab5btPdkBkrgmVtYiM9deCuoZzm9jg8N8yihq1UFl+aWdCx3qhBBTudD7jH+HvhmowaoWoF77RLR4ajHjr1OCv8tgB7po+F3Uztc9nY1a50p8KJ+t/UOBRNSIDGcee4i3AL2gzm7A0Ntm8rr/UkwPMN1bKvwO60LmsJ18qpvLy74LvuwyNyFltXUG3hJj0/n2y6MvJKUniCRY6icfqrIgE5ybEvwK/ijCWDWO0QxnS4dXjbtpMdAz1x7VRXuE1zfwjTxf03QrKi/w7DLixNXfkRDPsH8nQB+D3E9yTBXoxrV4dgdmMfJ4/tGLHtSB1JtzNh22+5/N62Uqov+xBK/WtUDiRmjT4EY+sca/XBAyh7MXWr1L4LIr95ajWVl8g/tO+/cGh//HBmoEo5+gSGO5CI/Vi6wPmJEkifIBBZ2YzrdWl6bRQBdh7W1ozqdqr0ew3r3arCzuTUlaJ5sKKzelaIHvkrKN/q3V2MSzG2pIcKe8kavphfM1H8EM/DIrTIrmd7ZqzCJk8yi9V9lYtwEuohSIkDuVNBK72ehO0aYTdRANe7EF5iqjwk5znNEDtKHh6c5YTyYOtomldOKe0SVlZdo1MJMTYyA5iJ+iLTn9lpjLkepy65EGvsIpby2nj7AFuqO/CJZUX+BCzrEKW9qfh4EuVRSbmJ+GtSRPsNtc1Hh71y6omlIHNu6dQoyzM69lEtyAV3q8ppX67notxEhs0PlxPUHrzX8hU3uv3cZiaPP1GcZfyRYT4Kj9kUCLNg382XX5Fut3zGQVaoqlE8mezNspuKY9P8FIlP6HQdN3PJkzz86jkMeYq0a1EecRND0ZVsR4Oc+d7prhDvv93Tt3Aabich6ATE1sBeIELwRQprvQAmgi8SOMuLNFerPuzt2OFIqbXOTo7aLixZCoJkttcjKpM6x/VMuoCxWNrv7ddNwvRWvirXrlOwuhd2Iil/UpltPK/Z2ZWMsickyZ5HsmelQZmNSLmbN7AuxEfP7eZK+GJhUe1yB50euMkOG41hzZpWqrbJrvhM5NuC53qE79Kw8snSDT1Qnor0N/Jte2JFpEv2SNDdKgx3OgQqEBfgQ0mhNB2ARZJwTCWPqK5YHlR/en0QYz6iBeuRJxXto2zmedFCCVOolOQj7Y1f/kUrmqlNyj+U3312+OGDoLPTZ3yu//3lX+yezKsSJVVb7/XQv2QNzLoxkrzx32tygifOF7V6E0SY7c97svSe6Z47ueOkqrse1YrRd/h+7NociQMkqwKaU6HrNZkHtAR/TOajKgXceaWPPBE1+ChoqfzuQ7H4TcigvHFWnbhC92SFvUWkfLT9ROocG9Uqk4mQdCzBCBNAxZRSIpEXaK0Hh97iSzm7bKGMY2+jU3F3j9JSkfVDDyLJxp6rlTD9XZj3oVQ0WK8o5aVh8mLfVaAMglw37Jh3ekflXW+S/ajYjNc7FyRDCTw3Y/rn+t4fiT8do8JA/YU/H9RsTv8esXsy1a3Y6sjYVg1rtkeVM6O5VLp9rZz+Vcci/FxyiQbRLuJHQHZFawKD8oxCnyon0vpF7pFYb2LXgrAWUZlUuvYn4rwgSisZ1CLJH45VJd8jXPF9jihfR6qabqaeLUWSXRJe6eSbXNM921AhVyhEHVSygACADGgxg3i9XTysSQEBAGBxkXgGyflQOd314CABCIAjZE5yvuIRUKhDQAMeb93dQyAOtwsRpIhWp+sADuPjcVPSTpTf5ChYCq/Nee8b6Ie+/CYvuy/r0rVmCq8AewEAIeAc9x4UAHAAgAcApSUhdnACzguAIRQBSPDidA5iVDruosvue+67f63u/wOzf9kIfwt2HgDKDIO7ZD/B+j007Sdxc08OZRAngr9+f/EVwMP7l3TuKTYM/FYsfK6OIgCgf/YGKh9hhFY20w7PdL3dRwBCRMgICfRovgNtGmqoY2JrYWXt5eruwQyNCY9MjIovzCsQrMg9eaT27LEzxy+0NTS3ZJCevv7Hb//P73volUem/fnx6/fC9/RPaR01OG10zvSi2SXj8+Z19Hq7dkajTat9h2UTq8uh0+my4/8u3c5XfEaxh7n1ckZ4DvAe4jvGb8Ik/yncawKu4l0XyLobgtwU4o5gt90S5p44z0R4INZT0R5L8lqKt5K9keqddB/xfZDmvWxfZfki02elZhT5J99PJcSE/iqGKSex0iKssqaHYG0EEIUHXSckeCnDJzm+qTSvzKwKc1b3YPo9Kw7gzndw+b39nh/ASwEAwNOvZBL7Wf//wpbzPACyBtYBIFv/mr9fQdaNNfrjFhrzfv2eno9rBgDE43OE4gbK0RX4HZZSuCKE1ogmdGMYGLahF3z9BOMuapGAVuTAGvmI17tZ5FtR0W4LknLBrdzo4m15oLt4nwdmoygLw/5eu53OE3dBy63Xxs+ktS7acy3rXbdapwT9RKbLBidrp3jrbtzBbdTjIDqxC7e8CR0IRwxe6ln/maQqqNEXHMNCYDIcRLiHKu0olt6H19yZRz3ttiApF9zqzYO8LQucbpkTYiwM+3u5nZpG3DyRF7QTM2GrqfTaDWcjfQcy4AuhL8rtSd1wT06S+9jdB94WJlc8+6bWhIO2i1PnmEBHludBEEQBgILnhb4JAYXaoBMAB+SacToAAAEo1HeKCGqs70wCVf7wgBCkAaBUyj+FgL6HCgdLYE7hwSdMEcCmEEUERpsUCeh1KCmg9kZJg+5AyYL+dJUcMMY2l7Fkyxd5sjl3ssRHnic9oQbyYh6s/pYc2b3snKKxpDP+skKeddujVRDKkiFTMdQFKCuMeTsqRcXSL0ymLHxCwsNgHnIly5dKgAuzNv3pUO5ykYlSoqKDBr6icNeV4ktDxxEGxXUahEo2nQXyFbDIsv2S5QrBl6EEBgtZoWMgcgyp2XhZFNZDX1bcP0Xw3VAky99alI/JbN7c+cuSGlkSs+jnOXnOHGd9c26yiMilLA46Kwjw5bhVjsSpDB2ky6Cgi53RdKkK5LmvLaa0UUrq5fitwMNvWovW0gAAAAA=);
        }
        </mj-style>
      </mj-head>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text ${reusableTextStyles}>&#128184; NFT Pawn Shop</mj-text>
    
            <mj-divider border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>
            <a href="${components.viewLinks[0]}" ${reusableAnchorStyles};">
              &#128196; ${components.header}
            </a>
            </mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>${components.mainMessage}</mj-text>
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
        ${components.loanDetails.map(
          (detail) => `
            <mj-text ${reusableTextStyles}>${detail}</mj-text>
            `,
        )}
    
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>View the loan at
              <a href="${components.viewLinks[0]}" ${reusableAnchorStyles};>
                ${components.viewLinks[0]}
              </a>
            </mj-text>
  
        ${
          !!components.viewLinks[1] &&
          `
            <mj-text ${reusableTextStyles}>View transaction at
                <a href="${components.viewLinks[1]}" ${reusableAnchorStyles};>
                ${components.viewLinks[1].substring(
                  8,
                  components.viewLinks[1].length - 60,
                )}...
                </a>
            </mj-text>
            `
        }
            <mj-divider border-style="dashed" border-width="1px"></mj-divider>
    
            <mj-text ${reusableTextStyles}>This is an automatically generated email. To stop notifications, visit
            <a href="${components.footer}" ${reusableAnchorStyles};>
              ${components.footer.substring(
                8,
                components.footer.length - 36,
              )}...
            </a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `,
    {},
  ).html;
}
