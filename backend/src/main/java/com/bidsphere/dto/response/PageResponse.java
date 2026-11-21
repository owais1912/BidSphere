package com.bidsphere.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageResponse<T> {
    private java.util.List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
