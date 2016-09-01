require 'open-uri'

class ApiController < ApplicationController


  def table
    url = "http://epa-dev2.e-promo.ru/?r=site/testtabledata&startDate=#{table_params[:startDate]}
      &endDate=#{table_params[:endDate]}&offset=#{table_params[:offset]}&limit=#{table_params[:limit]}"

    render json: JSON.load(open(url))
  end

  def chart
    url = "http://epa-dev2.e-promo.ru/?r=site/testchartdata&startDate=#{chart_params[:startDate]}
      &endDate=#{chart_params[:endDate]}"

    render json: JSON.load(open(url))
  end

  private

    def table_params
      params.permit(:startDate, :endDate, :offset, :limit)
    end

    def chart_params
      params.permit(:startDate, :endDate)
    end

end
