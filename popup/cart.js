function getCart() {
  const table = `<tbody>
        <tr class="">
            <td>
                <div>08:00 - 08:50</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>09:00 - 09:50</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>10:10 - 11:00</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>11:10 - 12:00</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>12:10 - 13:00</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>13:20 - 14:10</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>14:20 - 15:10</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>15:30 - 16:20</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>16:30 - 17:20</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>17:30 - 18:20</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>18:30 - 19:20</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>19:30 - 20:20</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>
                <div>20:30 - 21:20</div>
            </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
        </tr>
        <tr class="">
            <td>無上課時間</td>
            <td colspan="6">
            </td>
        </tr>
    </tbody>`;

  $("#cart").append(table);
}

export { getCart };
