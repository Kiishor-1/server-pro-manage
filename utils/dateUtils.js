const startOfDay = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};


const endOfDay = (date = new Date()) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};


const startOfWeek = (date = new Date()) => {
    const start = new Date(date);
    let day = start.getDay();
    if (day === 0) day = 7;
    start.setDate(start.getDate() - (day - 1));
    start.setHours(0, 0, 0, 0);
    return start;
};

const endOfWeek = (date = new Date()) => {
    const end = new Date(date);
    let day = end.getDay();
    if (day === 0) day = 7;
    end.setDate(end.getDate() + (7 - day));
    end.setHours(23, 59, 59, 999);
    return end;
};


const startOfMonth = (date = new Date()) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
};

const endOfMonth = (date = new Date()) => {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return end;
};

module.exports = {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth
};
